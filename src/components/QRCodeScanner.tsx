import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLabelById } from '@/utils/storage';
import { playAudio, base64ToBlob, textToSpeech, checkAudioCompatibility } from '@/utils/audio';
import { announceToScreenReader, provideHapticFeedback } from '@/utils/accessibility';

interface QRCodeScannerProps {
  accessibilityMode?: boolean;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ accessibilityMode = false }) => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [labelName, setLabelName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentLabel, setCurrentLabel] = useState<any>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    audioRef.current.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      setError('Audio playback failed. Try again.');
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, []);

  useEffect(() => {
    const { supported, issues } = checkAudioCompatibility();
    if (!supported) {
      toast({
        title: "Audio compatibility issues",
        description: issues.join(', '),
        variant: "destructive",
      });
    }
    
    if (accessibilityMode) {
      announceToScreenReader('Scanner ready. Accessibility features enabled.');
    }
  }, [accessibilityMode]);

  const startNewScan = () => {
    setScanResult(null);
    setError(null);
    setLabelName(null);
    setIsPlaying(false);
    setCurrentLabel(null);
    setScanning(true);
    
    if (accessibilityMode) {
      announceToScreenReader('Scanner activated with accessibility features enabled. Ready to scan QR codes.');
    } else {
      announceToScreenReader('Scanner activated, ready to scan QR codes');
    }
  };

  const handleScan = async (data: string | null) => {
    if (!data || !scanning) return;
    
    try {
      console.log("QR code data received:", data);
      let parsedData;
      
      try {
        parsedData = JSON.parse(data);
      } catch (parseErr) {
        console.error("Failed to parse as JSON, trying alternative format");
        
        const match = data.match(/labelId[":=\s]+([^",}\s]+)/i);
        if (match && match[1]) {
          parsedData = { labelId: match[1] };
        } else {
          throw new Error("Could not extract labelId");
        }
      }
      
      if (!parsedData.labelId) {
        setError('Invalid QR code format');
        setScanning(false);
        announceToScreenReader('Invalid QR code format', 'assertive');
        return;
      }
      
      console.log("Parsed label ID:", parsedData.labelId);
      setScanResult(parsedData.labelId);
      setScanning(false);
      
      if (accessibilityMode) {
        provideHapticFeedback();
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 100, 100]);
        }
      } else {
        provideHapticFeedback();
      }
      
      await fetchLabel(parsedData.labelId);
    } catch (err) {
      console.error('Error parsing QR code data:', err);
      setError('Could not read QR code data');
      setScanning(false);
      
      if (accessibilityMode) {
        announceToScreenReader('Error reading QR code. Please try again with better lighting or positioning.', 'assertive');
      } else {
        announceToScreenReader('Could not read QR code data', 'assertive');
      }
    }
  };

  const fetchLabel = async (labelId: string) => {
    try {
      setIsLoading(true);
      
      const label = getLabelById(labelId);
      if (!label) {
        console.error(`Label not found with ID: ${labelId}`);
        setError('Label not found');
        announceToScreenReader('Label not found', 'assertive');
        return;
      }
      
      setLabelName(label.name);
      setCurrentLabel(label);
      announceToScreenReader(`Found label: ${label.name}`);
      toast({
        title: "Label found",
        description: label.name,
      });
      
      if (!isMuted) {
        playLabelAudio();
      }
    } catch (err) {
      console.error('Error fetching label:', err);
      setError('Failed to fetch label');
      announceToScreenReader('Failed to fetch label', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  const playLabelAudio = async () => {
    if (!currentLabel) return;
    
    try {
      if (accessibilityMode) {
        announceToScreenReader('Playing audio for label: ' + currentLabel.name);
      }
      
      setIsPlaying(true);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (currentLabel.audioData) {
        console.log("Playing recorded audio for label:", currentLabel.name);
        const audioBlob = base64ToBlob(currentLabel.audioData);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onloadedmetadata = () => {
            const playPromise = audioRef.current?.play();
            if (playPromise) {
              playPromise.catch(error => {
                console.error("Play promise rejected:", error);
                toast({
                  title: "Playback issue",
                  description: "Could not auto-play audio due to browser restrictions. Try tapping play button.",
                  variant: "destructive",
                });
                setIsPlaying(false);
              });
            }
          };
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
        }
      } else if (currentLabel.content) {
        console.log("Using text-to-speech for label:", currentLabel.name);
        await textToSpeech(currentLabel.content);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error playing label audio:', err);
      setError('Failed to play audio');
      announceToScreenReader('Failed to play audio', 'assertive');
      setIsPlaying(false);
    }
  };

  const handleError = (err: Error) => {
    console.error('QR scanner error:', err);
    setError('Scanner error. Please try again.');
    setScanning(false);
    announceToScreenReader('Scanner error. Please try again.', 'assertive');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    announceToScreenReader(isMuted ? 'Audio enabled' : 'Audio muted');
  };

  const playLabelAgain = () => {
    if (currentLabel) {
      playLabelAudio();
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        startNewScan();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className={`overflow-hidden shadow-sm ${accessibilityMode ? 'border-primary border-2' : ''}`}>
        {scanning ? (
          <div className="relative">
            <QrReader
              onResult={(result) => {
                if (result) {
                  handleScan(result.getText());
                }
              }}
              constraints={{ facingMode: 'environment' }}
              videoStyle={{ width: '100%' }}
              containerStyle={{ width: '100%' }}
              scanDelay={500}
              ViewFinder={() => (
                <div className={`absolute inset-0 border-2 ${accessibilityMode ? 'border-primary-500' : 'border-white/70'} opacity-70 rounded-lg`} />
              )}
            />
            <div className={`absolute inset-0 border-[3px] ${accessibilityMode ? 'border-primary' : 'border-white/70'} rounded-lg pointer-events-none`} />
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader className="h-12 w-12 text-primary animate-spin" />
                <p className="text-center font-medium">Loading label data...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <p className="text-destructive font-semibold">{error}</p>
                <Button onClick={startNewScan}>Try Again</Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Label Found</h3>
                  <p className="text-2xl font-bold text-primary">{labelName}</p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  {isPlaying ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          setIsPlaying(false);
                        }
                      }}
                    >
                      <Pause className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={playLabelAgain}
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={startNewScan}
                >
                  Scan Another Code
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

QRCodeScanner.defaultProps = {
  accessibilityMode: false
};

export default QRCodeScanner;
