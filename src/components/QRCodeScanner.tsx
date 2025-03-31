
import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Pause, Play, Volume2, VolumeX, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLabelById } from '@/utils/storage';
import { base64ToBlob, playAudio, textToSpeech, checkAudioCompatibility } from '@/utils/audio';
import { announceToScreenReader, provideHapticFeedback } from '@/utils/accessibility';
import { useNavigate } from 'react-router-dom';

const QRCodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [labelName, setLabelName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentLabel, setCurrentLabel] = useState<any>(null);
  const [playbackCompleted, setPlaybackCompleted] = useState<boolean>(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const navigate = useNavigate();

  // Create an audio element on component mount
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    
    // Set up event listeners
    const handleEnded = () => {
      console.log('Audio playback ended');
      setIsPlaying(false);
      setPlaybackCompleted(true);
    };
    
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      setError('Audio playback failed. Try again.');
      toast({
        title: "Audio Error",
        description: "Playback failed. Please try the play button.",
        variant: "destructive"
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
  }, []);

  // Check audio compatibility on mount and unlock audio
  useEffect(() => {
    const { supported, issues } = checkAudioCompatibility();
    if (!supported) {
      toast({
        title: "Audio compatibility issues",
        description: issues.join(', '),
        variant: "destructive",
      });
    }
    
    // Function to unlock audio on iOS/Safari
    const unlockAudio = () => {
      console.log("Attempting to unlock audio...");
      
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log("Resuming suspended AudioContext");
        audioContextRef.current.resume().catch(console.error);
      }
      
      // Play and immediately pause the audio element to unlock it
      if (audioRef.current) {
        console.log("Creating and playing silent buffer");
        audioRef.current.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAADQgD///////////////////////////////////////////////8AAAA5TEFNRTMuMTAwBK8AAAAAAAAAABSAJAJAQgAAgAAAA0L2YLwxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=";
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log("Audio unlocked successfully");
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }).catch(e => {
            console.log('Audio unlock failed:', e);
            // We'll try again on user interaction
          });
        }
      }
      
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('touchend', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
    
    // Add listeners for user interaction
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('touchend', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
    
    // Try immediate unlock as well
    unlockAudio();
    
    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('touchend', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  // Reset state when starting a new scan
  const startNewScan = () => {
    console.log("Starting new scan");
    setScanResult(null);
    setError(null);
    setLabelName(null);
    setIsPlaying(false);
    setCurrentLabel(null);
    setPlaybackCompleted(false);
    setScanning(true);
    announceToScreenReader('Scanner activated, ready to scan QR codes');
  };

  // Navigate to home
  const goToHome = () => {
    navigate('/');
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

  // Fetch the label and automatically play audio
  const fetchLabel = async (labelId: string) => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous error
      
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
      
      console.log("Label found, will attempt to play audio automatically");
      
      // Always play audio automatically after finding a label
      // Small delay to ensure UI updates first and audio context is ready
      setTimeout(() => {
        playLabelAudio();
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching label:', err);
      setError('Failed to fetch label');
      announceToScreenReader('Failed to fetch label', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  // Play the label audio with improved handling for mobile devices
  const playLabelAudio = async () => {
    if (!currentLabel) {
      console.log("No current label to play");
      return;
    }
    
    try {
      setIsPlaying(true);
      setError(null); // Clear any previous error messages
      setPlaybackCompleted(false);
      
      console.log("Attempting to play audio for label:", currentLabel.name);
      
      // Make sure AudioContext is running (for iOS)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log("Resuming suspended AudioContext before playback");
        await audioContextRef.current.resume();
      }
      
      if (audioRef.current) {
        // Stop any current playback
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        console.log("Audio element reset");
      }
      
      if (currentLabel.audioData) {
        // Play recorded audio
        console.log("Label has recorded audio data, preparing to play");
        const audioBlob = base64ToBlob(currentLabel.audioData);
        
        // Create object URL for the blob
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log("Created URL for audio blob:", audioUrl);
        
        if (audioRef.current) {
          // Configure the audio element
          audioRef.current.src = audioUrl;
          audioRef.current.preload = 'auto';
          audioRef.current.muted = isMuted;
          audioRef.current.volume = 1.0; // Ensure full volume
          
          console.log("Audio element configured, waiting for canplay event");
          
          // Define a function to handle when audio is ready to play
          const playWhenReady = () => {
            console.log("Audio is ready to play");
            
            if (audioRef.current) {
              console.log("Attempting to play audio");
              const playPromise = audioRef.current.play();
              
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  console.log("Audio playback started successfully");
                }).catch(error => {
                  console.error("Play promise rejected:", error);
                  
                  // On iOS, we might need user interaction
                  toast({
                    title: "Tap to play",
                    description: "Tap the play button to hear the audio",
                  });
                  setError(null); // Don't show error, just guide the user
                  setIsPlaying(false);
                });
              }
            }
          };
          
          // Add the canplay event listener
          audioRef.current.addEventListener('canplay', playWhenReady, { once: true });
          
          // Set onended to clean up URL object and update UI
          audioRef.current.onended = () => {
            console.log("Audio playback ended naturally");
            setIsPlaying(false);
            setPlaybackCompleted(true);
            URL.revokeObjectURL(audioUrl);
          };
          
          // Start loading the audio
          console.log("Loading audio");
          audioRef.current.load();
          
          // Fallback if canplay doesn't fire within 5 seconds
          setTimeout(() => {
            if (isPlaying && audioRef.current) {
              console.log("Canplay event didn't fire within timeout, trying to play anyway");
              audioRef.current.removeEventListener('canplay', playWhenReady);
              playWhenReady();
            }
          }, 5000);
        }
      } else if (currentLabel.content) {
        // Use text-to-speech
        console.log("Using text-to-speech for label:", currentLabel.name);
        try {
          await textToSpeech(currentLabel.content);
          console.log("Text-to-speech completed");
          setIsPlaying(false);
          setPlaybackCompleted(true);
        } catch (speechErr) {
          console.error("Text-to-speech error:", speechErr);
          setError('Text-to-speech failed. Try tapping the play button.');
          setIsPlaying(false);
        }
      } else {
        console.error("Label has no audio data or content");
        setError('This label has no audio content');
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
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
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
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-2 left-2 bg-background/80 hover:bg-background"
              onClick={goToHome}
              aria-label="Go to home"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px] relative">
            {/* Home button at top left */}
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-2 left-2 z-10" 
              onClick={goToHome}
              aria-label="Go to home"
            >
              <Home className="h-4 w-4" />
            </Button>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 mt-4">
                <Loader className="h-12 w-12 text-primary animate-spin" />
                <p className="text-center font-medium">Loading label data...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4 mt-8">
                <p className="text-destructive font-semibold">{error}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={startNewScan}>Try Again</Button>
                  <Button variant="outline" onClick={goToHome}>Go Home</Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 w-full pt-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Label Found</h3>
                  <p className="text-2xl font-bold text-primary">{labelName}</p>
                  
                  {/* Display content if available */}
                  {currentLabel?.content && (
                    <div className="mt-4 max-h-[180px] overflow-y-auto text-left p-4 bg-muted/30 rounded-md">
                      <p className="whitespace-pre-line">{currentLabel.content}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-4 mt-6">
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
                      aria-label="Pause audio"
                    >
                      <Pause className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={playLabelAgain}
                      aria-label="Play audio"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button 
                    className="flex-1" 
                    onClick={startNewScan}
                  >
                    Scan Another Code
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={goToHome}
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QRCodeScanner;
