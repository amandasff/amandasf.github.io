
import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Pause, Play, Volume2, VolumeX, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLabelById } from '@/utils/storage';
import { base64ToBlob, playAudio, textToSpeech, checkAudioCompatibility } from '@/utils/audio';
import { announceToScreenReader, provideHapticFeedback } from '@/utils/accessibility';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const QRCodeScanner: React.FC = () => {
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMobile = useIsMobile();

  // Create an audio element on component mount with mobile-specific handling
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    
    // Set up event listeners
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      setError('Try tapping the play button');
      toast({
        title: "Tap to Play",
        description: "Please tap the play button to hear the audio",
        variant: "default"
      });
    };
    
    // Add event listeners
    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handleError);
    
    // Initialize AudioContext for better mobile support
    try {
      // @ts-ignore - for older browser compatibility
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }

    // Create a special iOS-friendly silent buffer and play it to unlock audio
    if (isMobile) {
      const unlockAudioForIOS = () => {
        document.body.removeEventListener('touchstart', unlockAudioForIOS);
        
        // Unlock audio context
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(console.error);
        }
        
        // Create and play a silent buffer
        try {
          const silentBuffer = audioContextRef.current?.createBuffer(1, 1, 22050);
          const source = audioContextRef.current?.createBufferSource();
          if (silentBuffer && source && audioContextRef.current) {
            source.buffer = silentBuffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
            source.stop(0.001); // Very short
            
            console.log("iOS audio context unlocked");
          }
        } catch (e) {
          console.error("Failed to create silent buffer:", e);
        }
        
        // Also try playing a short sound with the Audio element
        if (audioRef.current) {
          audioRef.current.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwPj4+Pj4+TExMTExaWlpaWlpoaGhoaHd3d3d3d4aGhoaGlJSUlJSUnZ2dnZ2dsbGxsbG/v7+/v8bGxsbGxs7Ozs7O1tbW1tbW3d3d3d3d5eXl5eXl8fHx8fHx+vr6+vr6/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+AABDb21tZW50AABMYXZjNTguMTM4LjEwMAAAAAAAAAAAAAAAVGl0bGUAAEF1ZGlvLndhcnAAAAAAAAAAAAAAAFllYXIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//7UAAAABUQZp4OjisABwAAVygnCQf7//vYRAAAAnZXVnbWkAAEMoAk/AAAAF9ltlVsYUgAQzAEH8AAAAT/////+7GUCs27u8BgMB//8BgYDAYDAYDAb/g';
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("iOS audio element unlocked");
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
              })
              .catch(e => console.error("iOS audio unlock failed:", e));
          }
        }
      };
      
      // Add listener for user interaction to unlock audio
      document.body.addEventListener('touchstart', unlockAudioForIOS, { once: true });
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, [isMobile]);

  // Check audio compatibility on mount
  useEffect(() => {
    const { supported, issues } = checkAudioCompatibility();
    if (!supported) {
      toast({
        title: "Audio compatibility issues",
        description: issues.join(', '),
        variant: "destructive",
      });
    }
  }, []);

  // Reset state when starting a new scan
  const startNewScan = () => {
    setScanResult(null);
    setError(null);
    setLabelName(null);
    setIsPlaying(false);
    setCurrentLabel(null);
    setScanning(true);
    announceToScreenReader('Scanner activated, ready to scan QR codes');
  };

  // Handle successful scan
  const handleScan = async (data: string | null) => {
    if (!data || !scanning) return;
    
    // Parse the data from the QR code
    try {
      console.log("QR code data received:", data);
      let parsedData;
      
      try {
        parsedData = JSON.parse(data);
      } catch (parseErr) {
        console.error("Failed to parse as JSON, trying alternative format");
        
        // Handle potential string format differences
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
      provideHapticFeedback();
      
      // Get label from storage
      await fetchLabel(parsedData.labelId);
    } catch (err) {
      console.error('Error parsing QR code data:', err);
      setError('Could not read QR code data');
      setScanning(false);
      announceToScreenReader('Could not read QR code data', 'assertive');
    }
  };

  // Fetch the label without playing
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
        // Auto-play audio if not muted
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

  // Play the label audio - Mobile-optimized version
  const playLabelAudio = async () => {
    if (!currentLabel) return;
    
    try {
      setIsPlaying(true);
      
      // Make sure AudioContext is running (for iOS)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      if (audioRef.current) {
        // Stop any current playback
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }
      
      if (currentLabel.audioData) {
        // Play recorded audio with mobile-specific handling
        console.log("Playing recorded audio for label:", currentLabel.name);
        
        // Convert base64 to blob
        const audioBlob = base64ToBlob(currentLabel.audioData);
        
        // Mobile browsers handle URLs differently, so use a more direct approach
        if (isMobile) {
          try {
            // Create object URL for the blob
            const audioUrl = URL.createObjectURL(audioBlob);
            
            if (audioRef.current) {
              // Set up audio element
              audioRef.current.src = audioUrl;
              audioRef.current.preload = 'auto';
              
              // Add event listener to handle successful loading
              const handleCanPlay = () => {
                console.log("Mobile: Audio can play through");
                if (audioRef.current) {
                  // Attempt to play
                  const mobilePlayPromise = audioRef.current.play();
                  
                  if (mobilePlayPromise !== undefined) {
                    mobilePlayPromise
                      .then(() => {
                        console.log("Mobile: Audio playback started successfully");
                      })
                      .catch(err => {
                        console.error("Mobile: Playback failed:", err);
                        setIsPlaying(false);
                        setError('Tap the play button to hear the audio');
                        toast({
                          title: "Tap to Play",
                          description: "Please tap the play button to hear the audio",
                          duration: 5000
                        });
                      });
                  }
                }
                
                // Clean up event listener
                if (audioRef.current) {
                  audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
                }
              };
              
              // Set up for cleaning URL object on ended
              const handleMobileEnded = () => {
                console.log("Mobile: Audio playback ended");
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
                
                // Remove this once-only listener
                if (audioRef.current) {
                  audioRef.current.removeEventListener('ended', handleMobileEnded);
                }
              };
              
              // Add the event listeners
              audioRef.current.addEventListener('canplaythrough', handleCanPlay, { once: true });
              audioRef.current.addEventListener('ended', handleMobileEnded, { once: true });
              
              // Start loading the audio
              audioRef.current.load();
            }
          } catch (mobileErr) {
            console.error("Mobile audio playback error:", mobileErr);
            
            // Fallback to the general playAudio utility
            await playAudio(audioBlob);
            setIsPlaying(false);
          }
        } else {
          // Desktop browser handling
          await playAudio(audioBlob);
          setIsPlaying(false);
        }
      } else if (currentLabel.content) {
        // Use text-to-speech
        console.log("Using text-to-speech for label:", currentLabel.name);
        await textToSpeech(currentLabel.content);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error playing label audio:', err);
      setError('Tap the play button to hear the audio');
      announceToScreenReader('Failed to play audio automatically. Please use the play button.', 'assertive');
      setIsPlaying(false);
    }
  };

  // Handle scanning errors
  const handleError = (err: Error) => {
    console.error('QR scanner error:', err);
    setError('Scanner error. Please try again.');
    setScanning(false);
    announceToScreenReader('Scanner error. Please try again.', 'assertive');
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    announceToScreenReader(isMuted ? 'Audio enabled' : 'Audio muted');
  };

  // Play the label again
  const playLabelAgain = () => {
    if (currentLabel) {
      // Unlock audio context if needed (iOS requirement)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(console.error);
      }
      
      playLabelAudio();
    }
  };

  // Auto-restart scanning after a delay when error occurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        startNewScan();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="overflow-hidden shadow-sm">
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
                <div className="absolute inset-0 border-2 border-primary-500 opacity-70 rounded-lg" />
              )}
            />
            <div className="absolute inset-0 border-[3px] border-white/70 rounded-lg pointer-events-none" />
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px] relative">
            {/* Home button - replaced X button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2" 
              asChild
            >
              <Link to="/" aria-label="Go to home page">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 mt-4">
                <Loader className="h-12 w-12 text-primary animate-spin" />
                <p className="text-center font-medium">Loading label data...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4 mt-4">
                <p className="text-destructive font-semibold">{error}</p>
                <Button onClick={startNewScan}>Try Again</Button>
              </div>
            ) : (
              <div className="text-center space-y-6 mt-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Label Found</h3>
                  <p className="text-2xl font-bold text-primary">{labelName}</p>
                  
                  {/* Display content if available */}
                  {currentLabel?.content && (
                    <div className="mt-4 max-h-[200px] overflow-y-auto text-left p-4 bg-muted/30 rounded-md">
                      <p className="whitespace-pre-line">{currentLabel.content}</p>
                    </div>
                  )}
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

export default QRCodeScanner;
