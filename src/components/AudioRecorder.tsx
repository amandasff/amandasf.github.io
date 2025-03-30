
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Play, Loader2 } from 'lucide-react';
import { startRecording, stopRecording, playAudio, blobToBase64 } from '@/utils/audio';
import { announceToScreenReader, provideHapticFeedback } from '@/utils/accessibility';
import { useToast } from '@/components/ui/use-toast';

interface AudioRecorderProps {
  onAudioRecorded: (audioData: string) => void;
  initialAudioData?: string | undefined;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded, initialAudioData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize with initialAudioData if provided
  useEffect(() => {
    if (initialAudioData) {
      try {
        // Create a data URL from the base64 string
        const dataUrl = `data:audio/mpeg;base64,${initialAudioData}`;
        
        // Fetch the data and convert to blob
        fetch(dataUrl)
          .then(response => response.blob())
          .then(blob => {
            setAudioBlob(blob);
            console.log('Successfully loaded initial audio data');
          })
          .catch(error => {
            console.error('Error converting initialAudioData to blob:', error);
          });
      } catch (error) {
        console.error('Error processing initialAudioData:', error);
      }
    }
  }, [initialAudioData]);

  // Create audio element for playback
  useEffect(() => {
    audioRef.current = new Audio();
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Start recording
  const handleStartRecording = async () => {
    try {
      setIsProcessing(true);
      announceToScreenReader('Starting recording');
      
      // Reset state
      setAudioBlob(null);
      setRecordingTime(0);
      
      // Start recording
      const recorder = await startRecording();
      mediaRecorderRef.current = recorder;
      
      setIsRecording(true);
      provideHapticFeedback();
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      announceToScreenReader('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
      announceToScreenReader('Could not start recording', 'assertive');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    try {
      setIsProcessing(true);
      announceToScreenReader('Stopping recording');
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop recording
      const blob = await stopRecording(mediaRecorderRef.current);
      setAudioBlob(blob);
      
      // Convert to base64 and notify parent
      const base64 = await blobToBase64(blob);
      onAudioRecorded(base64);
      
      setIsRecording(false);
      provideHapticFeedback();
      
      announceToScreenReader('Recording finished');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to save recording.",
        variant: "destructive"
      });
      announceToScreenReader('Error stopping recording', 'assertive');
    } finally {
      setIsProcessing(false);
    }
  };

  // Play recorded audio with improved mobile support
  const handlePlayRecording = async () => {
    if (!audioBlob) return;
    
    try {
      setIsPlaying(true);
      announceToScreenReader('Playing recording');
      
      console.log('Attempting to play audio blob:', audioBlob.type, audioBlob.size);
      
      // Create new URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        // Set up event handlers for this play attempt
        const audio = audioRef.current;
        
        const playPromise = new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            console.log('Audio playback ended');
            resolve();
          };
          
          audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            reject(e);
          };
          
          // Set source and attempt to play
          audio.src = audioUrl;
          audio.load();
          
          // Mobile browsers require user interaction
          const playAttempt = audio.play();
          
          if (playAttempt !== undefined) {
            playAttempt
              .then(() => console.log('Playback started'))
              .catch(e => {
                console.error('Playback failed to start:', e);
                reject(e);
              });
          }
        });
        
        await playPromise;
        
        // Clean up
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
      } else {
        throw new Error('Audio element not available');
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      toast({
        title: "Playback Error",
        description: "Could not play recording. Try again or re-record.",
        variant: "destructive"
      });
      announceToScreenReader('Could not play recording', 'assertive');
      setIsPlaying(false);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center items-center w-full gap-3">
          <div className="text-lg font-medium w-16 text-center">
            {formatTime(recordingTime)}
          </div>
          
          <Progress 
            value={isRecording ? (recordingTime % 60) * (100 / 60) : 0} 
            className="flex-1" 
          />
        </div>
        
        <div className="flex justify-center items-center gap-4">
          {isRecording ? (
            <Button
              variant="destructive"
              size="icon"
              className="h-16 w-16 rounded-full shadow-md"
              onClick={handleStopRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Square className="h-8 w-8" />
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              size="icon"
              className="h-16 w-16 rounded-full shadow-md bg-primary hover:bg-primary/90"
              onClick={handleStartRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          )}
          
          {audioBlob && !isRecording && (
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handlePlayRecording}
              disabled={isPlaying || isProcessing}
            >
              <Play className="h-6 w-6" />
            </Button>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground text-center">
          {isRecording 
            ? 'Recording... Tap the square button to stop.' 
            : audioBlob 
              ? 'Recording complete. Tap the microphone to record again.' 
              : 'Tap the microphone button to start recording.'}
        </p>
      </div>
    </Card>
  );
};

export default AudioRecorder;
