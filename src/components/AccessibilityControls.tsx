
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Mic, 
  Volume2
} from "lucide-react";
import { 
  toggleHighContrast, 
  increaseTextSize, 
  decreaseTextSize, 
  resetTextSize,
  setupVoiceCommands,
  announceToScreenReader,
  speak
} from "@/utils/accessibility";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceCommandsActive, setVoiceCommandsActive] = useState(false);

  // Function to start voice commands
  const startVoiceCommands = () => {
    if (voiceCommandsActive) return;
    
    const commands = {
      "high contrast": toggleHighContrast,
      "increase size": increaseTextSize,
      "decrease size": decreaseTextSize,
      "reset size": resetTextSize,
      "home": () => window.location.href = '/',
      "create": () => window.location.href = '/create',
      "scan": () => window.location.href = '/scan',
      "my labels": () => window.location.href = '/labels',
    };
    
    try {
      setupVoiceCommands(commands);
      setVoiceCommandsActive(true);
      announceToScreenReader("Voice commands activated. Try saying 'high contrast', 'increase size', or 'home'.");
    } catch (error) {
      console.error("Failed to start voice commands:", error);
      announceToScreenReader("Voice commands not supported in this browser.");
    }
  };

  // Announce keyboard shortcuts
  const announceShortcuts = () => {
    speak(`
      Keyboard shortcuts available:
      Alt+1: Go to home page
      Alt+2: Go to create label page
      Alt+3: Go to scan label page
      Alt+4: Go to my labels page
      Alt+C: Toggle high contrast mode
      Alt+Plus: Increase text size
      Alt+Minus: Decrease text size
      Alt+0: Reset text size
    `);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-card border rounded-lg shadow-lg">
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full"
            aria-label={isOpen ? "Hide accessibility controls" : "Show accessibility controls"}
          >
            <Eye className="h-6 w-6" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 space-y-4">
          <div aria-live="polite" className="sr-only">
            Accessibility controls expanded
          </div>
          <div className="text-lg font-medium">Accessibility Options</div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={toggleHighContrast} 
              className="justify-start text-left"
              aria-label="Toggle high contrast mode"
            >
              High Contrast Mode
            </Button>
            
            <div className="flex gap-2">
              <Button onClick={increaseTextSize} aria-label="Increase text size">
                <ZoomIn className="mr-2 h-4 w-4" />
                Larger Text
              </Button>
              <Button onClick={decreaseTextSize} aria-label="Decrease text size">
                <ZoomOut className="mr-2 h-4 w-4" />
                Smaller Text
              </Button>
              <Button onClick={resetTextSize} aria-label="Reset text size">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
            
            <Button 
              onClick={startVoiceCommands} 
              disabled={voiceCommandsActive}
              aria-label="Enable voice commands"
            >
              <Mic className="mr-2 h-4 w-4" />
              {voiceCommandsActive ? "Voice Commands Active" : "Enable Voice Commands"}
            </Button>
            
            <Button 
              onClick={announceShortcuts}
              aria-label="Read keyboard shortcuts"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Read Keyboard Shortcuts
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Press Alt+C for high contrast, Alt+Plus to increase text size, Alt+Minus to decrease text size.
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AccessibilityControls;
