
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Mic, 
  Volume2,
  X
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
import { useIsMobile } from "@/hooks/use-mobile";

const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceCommandsActive, setVoiceCommandsActive] = useState(false);
  const isMobile = useIsMobile();
  
  // Detect viewport changes to ensure visibility on both mobile and desktop
  useEffect(() => {
    const handleResize = () => {
      // Adjust the panel position based on viewport size
      const panel = document.querySelector('.accessibility-panel') as HTMLElement;
      if (panel) {
        if (window.innerWidth < 640) {
          // Center on mobile
          panel.style.right = '50%';
          panel.style.transform = 'translateX(50%)';
        } else {
          // Right side on desktop
          panel.style.right = '1rem';
          panel.style.transform = 'none';
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Initial call
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className={`fixed ${isMobile ? 'bottom-2 left-0 right-0 mx-auto w-fit' : 'bottom-4 right-4'} z-50 accessibility-panel`}>
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
        <CollapsibleContent className={`p-3 space-y-3 ${isMobile ? 'max-w-[90vw] sm:max-w-sm' : ''}`}>
          <div aria-live="polite" className="sr-only">
            Accessibility controls expanded
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">Accessibility Options</div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={toggleHighContrast} 
              className="justify-start text-left"
              aria-label="Toggle high contrast mode"
              size={isMobile ? "sm" : "default"}
            >
              High Contrast Mode
            </Button>
            
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={increaseTextSize} 
                aria-label="Increase text size"
                size={isMobile ? "sm" : "default"}
              >
                <ZoomIn className="mr-2 h-4 w-4" />
                Larger Text
              </Button>
              <Button 
                onClick={decreaseTextSize} 
                aria-label="Decrease text size"
                size={isMobile ? "sm" : "default"}
              >
                <ZoomOut className="mr-2 h-4 w-4" />
                Smaller Text
              </Button>
              <Button 
                onClick={resetTextSize} 
                aria-label="Reset text size"
                size={isMobile ? "sm" : "default"}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
            
            <Button 
              onClick={startVoiceCommands} 
              disabled={voiceCommandsActive}
              aria-label="Enable voice commands"
              size={isMobile ? "sm" : "default"}
            >
              <Mic className="mr-2 h-4 w-4" />
              {voiceCommandsActive ? "Voice Commands Active" : "Enable Voice Commands"}
            </Button>
            
            <Button 
              onClick={announceShortcuts}
              aria-label="Read keyboard shortcuts"
              size={isMobile ? "sm" : "default"}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Read Keyboard Shortcuts
            </Button>
          </div>
          
          {!isMobile && (
            <div className="text-sm text-muted-foreground">
              Press Alt+C for high contrast, Alt+Plus to increase text size, Alt+Minus to decrease text size.
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AccessibilityControls;
