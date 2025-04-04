// Audio recorder for our project
// This is our first time working with audio in React
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Props for our component
interface AudioRecorderProps {
  onAudioRecorded: (audioData: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded }) => {
  // Basic state for our recorder
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Refs to store our audio stuff
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording function
  const handleStartRecording = async () => {
    try {
      // Get permission to use microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Reset chunks
      audioChunksRef.current = [];
      
      // Save audio data when available
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      // When recording stops, save the audio
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        setAudioBlob(audioBlob);
        
        // Convert to base64 for saving
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onAudioRecorded(base64.split(',')[1]);
        };
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Couldn't access microphone",
        variant: "destructive"
      });
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Play the recording
  const handlePlayAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Recording button */}
          <div className="flex items-center justify-between">
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="gap-2"
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              <span>
                {isRecording ? "Stop" : "Record"}
              </span>
            </Button>
            
            {/* Show time */}
            {isRecording && (
              <div className="text-sm text-muted-foreground">
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {/* Play button */}
          {audioBlob && !isRecording && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                <span>Play</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;
