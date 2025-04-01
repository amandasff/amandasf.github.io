
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  AccessibilityPreferences, 
  loadAccessibilityPreferences, 
  saveAccessibilityPreferences, 
  toggleHighContrast, 
  toggleLargeText,
  setupVoiceCommands,
  speak 
} from "@/utils/accessibility";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, Mic, Speaker, RotateCcw, Check } from "lucide-react";

interface AccessibilityMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ open, onOpenChange }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(loadAccessibilityPreferences());
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Apply preferences when component mounts or preferences change
  useEffect(() => {
    toggleHighContrast(preferences.highContrast);
    toggleLargeText(preferences.largeText);
    
    // Save preferences to localStorage
    saveAccessibilityPreferences(preferences);
    
    // Handle voice commands setup
    let cleanupVoiceCommands: undefined | (() => void);
    if (preferences.voiceCommands) {
      const commands = {
        "go to home": () => navigate("/"),
        "go to create": () => navigate("/create"),
        "go to scan": () => navigate("/scan"),
        "go to labels": () => navigate("/labels"),
        "reset settings": () => resetPreferences(),
      };
      
      try {
        setupVoiceCommands(commands);
        toast({
          title: "Voice commands activated",
          description: "Try saying: 'go to home', 'go to scan', etc."
        });
      } catch (error) {
        console.error("Failed to set up voice commands", error);
        toast({
          title: "Voice commands failed",
          description: "Please check microphone permissions",
          variant: "destructive"
        });
        // Reset the preference if it fails
        setPreferences(prev => ({ ...prev, voiceCommands: false }));
      }
    }
    
    return () => {
      if (cleanupVoiceCommands) cleanupVoiceCommands();
    };
  }, [preferences, navigate]);

  // Function to reset preferences
  const resetPreferences = () => {
    const defaultPreferences: AccessibilityPreferences = {
      highContrast: false,
      largeText: false,
      voiceCommands: false,
      textToSpeech: false
    };
    setPreferences(defaultPreferences);
    toast({
      title: "Settings reset",
      description: "Accessibility settings have been reset to defaults"
    });
  };

  // Handle preference changes
  const handlePreferenceChange = (key: keyof AccessibilityPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Provide immediate feedback
    if (key === 'highContrast') {
      toast({
        title: value ? "High contrast enabled" : "High contrast disabled"
      });
    } else if (key === 'largeText') {
      toast({
        title: value ? "Large text enabled" : "Large text disabled"
      });
    } else if (key === 'textToSpeech' && value) {
      speak("Text to speech is now enabled");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Accessibility Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-base">High Contrast</Label>
              <p className="text-sm text-muted-foreground">Enhance visual distinction between elements</p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => handlePreferenceChange('highContrast', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="large-text" className="text-base">Large Text</Label>
              <p className="text-sm text-muted-foreground">Increase text size for better readability</p>
            </div>
            <Switch
              id="large-text"
              checked={preferences.largeText}
              onCheckedChange={(checked) => handlePreferenceChange('largeText', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-commands" className="text-base">Voice Commands</Label>
              <p className="text-sm text-muted-foreground">Control the app with your voice</p>
            </div>
            <Switch
              id="voice-commands"
              checked={preferences.voiceCommands}
              onCheckedChange={(checked) => handlePreferenceChange('voiceCommands', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="text-to-speech" className="text-base">Text to Speech</Label>
              <p className="text-sm text-muted-foreground">Read screen content aloud</p>
            </div>
            <Switch
              id="text-to-speech"
              checked={preferences.textToSpeech}
              onCheckedChange={(checked) => handlePreferenceChange('textToSpeech', checked)}
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={resetPreferences}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilityMenu;
