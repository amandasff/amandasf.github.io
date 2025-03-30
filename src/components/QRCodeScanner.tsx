import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Pause, Play, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLabelById } from '@/utils/storage';
import { base64ToBlob, textToSpeech, checkAudioCompatibility } from '@/utils/audio';
import { announceToScreenReader, provideHapticFeedback } from '@/utils/accessibility';
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
  const [showRecipe, setShowRecipe] = useState<boolean>(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMobile = useIsMobile();

  // Create an audio element on component mount
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    
    // Set up event listeners
    const handleEnded = () => setIsPlaying(false);
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

  // Unlock audio on mobile devices - crucial for iOS/Safari
  useEffect(() => {
    const unlockAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(console.error);
      }
      
      // Create and play a silent buffer to unlock audio on iOS
      if (audioContextRef.current) {
        const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
      }
      
      // Also unlock the audio element
      if (audioRef.current) {
        audioRef.current.muted = true;
        audioRef.current.playsInline = true;
        audioRef.current.play().catch(() => {
          console.log('Silent playback failed but this is expected on some browsers');
        });
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.muted = false;
            audioRef.current.pause();
          }
        }, 50);
      }
    };
    
    // Add event listeners for user interaction to unlock audio
    const interactionEvents = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    interactionEvents.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });
    
    // Try to unlock immediately for subsequent page visits
    unlockAudio();
    
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, []);

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
    setShowRecipe(false);
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
        playLabelAudio(false); // Pass false to play intro only, not recipe
      }
    } catch (err) {
      console.error('Error fetching label:', err);
      setError('Failed to fetch label');
      announceToScreenReader('Failed to fetch label', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  // Play the label audio
  const playLabelAudio = async (includeRecipe = false) => {
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
        audioRef.current.src = '';
      }
      
      if (currentLabel.audioData) {
        // Play recorded audio
        console.log("Playing recorded audio for label:", currentLabel.name);
        const audioBlob = base64ToBlob(currentLabel.audioData);
        
        // Create object URL for the blob
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.preload = 'auto';
          
          // Mobile fix: add event listener for when audio is ready
          const playWhenReady = () => {
            console.log("Audio canplay event fired, attempting playback");
            const playPromise = audioRef.current?.play();
            if (playPromise) {
              playPromise.catch(error => {
                console.error("Playback failed:", error);
                // Try a user-initiated play on next interaction
                setIsPlaying(false);
                setError('Tab play button to hear audio');
              });
            }
          };
          
          audioRef.current.addEventListener('canplay', playWhenReady, { once: true });
          
          // Set up onended handler to clean up
          audioRef.current.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          // Start loading
          audioRef.current.load();
        }
      } else if (currentLabel.content) {
        // Use text-to-speech
        console.log("Using text-to-speech for label:", currentLabel.name);
        let contentToSpeak = currentLabel.content;
        
        // If it's a recipe label and includeRecipe is true, use full content
        // Otherwise only use the first part (before the recipe details)
        if (currentLabel.hasRecipe && !includeRecipe) {
          // Just use the first sentence or two - everything before "Recipe for"
          const recipeIndex = contentToSpeak.indexOf("Recipe for");
          if (recipeIndex > 0) {
            contentToSpeak = contentToSpeak.substring(0, recipeIndex);
          }
        }
        
        await textToSpeech(contentToSpeak);
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

  // Toggle recipe view
  const toggleRecipe = () => {
    setShowRecipe(!showRecipe);
    if (!showRecipe && currentLabel?.hasRecipe) {
      announceToScreenReader('Recipe details shown');
      // Play the full content including recipe when showing recipe
      if (!isPlaying) {
        playLabelAudio(true);
      }
    } else {
      announceToScreenReader('Recipe details hidden');
    }
  };

  // Auto-restart scanning after a delay when error occurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        startNewScan();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Get recipe text for display
  const getRecipeText = () => {
    if (!currentLabel?.content) return '';
    
    // Extract just the recipe part if it exists
    const content = currentLabel.content;
    const recipeIndex = content.indexOf("Recipe for");
    if (recipeIndex > 0) {
      return content.substring(recipeIndex);
    }
    return '';
  };

  // Check if current label has a recipe
  const hasRecipe = currentLabel?.hasRecipe || 
    (currentLabel?.content && currentLabel.content.includes("Recipe for"));

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
              <div className="text-center space-y-6 w-full">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Label Found</h3>
                  <p className="text-2xl font-bold text-primary">{labelName}</p>
                </div>
                
                {showRecipe && hasRecipe && (
                  <div className="bg-muted p-4 rounded-md text-left max-h-44 overflow-y-auto">
                    <h4 className="font-semibold mb-2">Recipe</h4>
                    <p className="text-sm whitespace-pre-line">{getRecipeText()}</p>
                  </div>
                )}
                
                <div className="flex justify-center space-x-3">
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
                      onClick={() => playLabelAudio(showRecipe)}
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
                  
                  {hasRecipe && (
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-12 w-12 rounded-full ${showRecipe ? 'bg-primary/10' : ''}`}
                      onClick={toggleRecipe}
                    >
                      <BookOpen className="h-6 w-6" />
                    </Button>
                  )}
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
