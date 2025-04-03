
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Volume2, Loader2 } from 'lucide-react';
import { textToSpeech } from '@/utils/audio';
import { announceToScreenReader } from '@/utils/accessibility';

interface TextToSpeechProps {
  initialText?: string;
  onTextChange: (text: string) => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ 
  initialText = '', 
  onTextChange 
}) => {
  const [text, setText] = useState(initialText);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange(newText);
  };

  // Play text-to-speech
  const handleSpeak = async () => {
    if (!text.trim()) return;
    
    try {
      setIsPlaying(true);
      announceToScreenReader('Playing text to speech');
      
      await textToSpeech(text);
      
      setIsPlaying(false);
    } catch (error) {
      console.error('Error playing text-to-speech:', error);
      announceToScreenReader('Could not play text-to-speech', 'assertive');
      setIsPlaying(false);
    }
  };

  return (
    <Card className="p-6 shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="font-medium">Enter text for label</div>
          <Input
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text to be spoken (e.g., Vitamin D)"
            className="w-full"
            aria-label="Label text"
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleSpeak}
            disabled={!text.trim() || isPlaying}
          >
            {isPlaying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Playing...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TextToSpeech;
