// Accessibility menu for our project
// This helps make our website easier to use
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
import { Eye, Mic, Speaker, RotateCcw } from "lucide-react";

// Props for our menu
interface AccessibilityMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ open, onOpenChange }) => {
  // Load saved settings
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(loadAccessibilityPreferences());
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Apply settings when page loads or changes
  useEffect(() => {
    // Change colors for better visibility
    toggleHighContrast(preferences.highContrast);
    // Make text bigger if needed
    toggleLargeText(preferences.largeText);
    
    // Save settings
    saveAccessibilityPreferences(preferences);
    
    // Set up voice commands if enabled
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
      } catch (error) {
        console.error('Error setting up voice commands:', error);
        toast({
          title: "Error",
          description: "Couldn't set up voice commands",
          variant: "destructive"
        });
      }
    }
  }, [preferences, navigate]);

  // Reset all settings to default
  const resetPreferences = () => {
    const defaultPreferences: AccessibilityPreferences = {
      highContrast: false,
      largeText: false,
      voiceCommands: false,
      textToSpeech: false
    };
    
    setPreferences(defaultPreferences);
    saveAccessibilityPreferences(defaultPreferences);
    
    // Tell user settings were reset
    toast({
      title: "Settings Reset",
      description: "All accessibility settings have been reset to default",
    });
    
    // Say it out loud if text to speech is on
    if (preferences.textToSpeech) {
      speak("Settings have been reset to default");
    }
  };

  // Change a setting
  const handlePreferenceChange = (key: keyof AccessibilityPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Tell user about the change
    const message = `${key} ${value ? 'enabled' : 'disabled'}`;
    toast({
      title: "Setting Changed",
      description: message,
    });
    
    // Say it out loud if text to speech is on
    if (preferences.textToSpeech) {
      speak(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <Label htmlFor="highContrast" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              High Contrast Mode
            </Label>
            <Switch
              id="highContrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => handlePreferenceChange('highContrast', checked)}
            />
          </div>
          
          {/* Large Text Mode */}
          <div className="flex items-center justify-between">
            <Label htmlFor="largeText" className="flex items-center gap-2">
              <Speaker className="h-4 w-4" />
              Large Text Mode
            </Label>
            <Switch
              id="largeText"
              checked={preferences.largeText}
              onCheckedChange={(checked) => handlePreferenceChange('largeText', checked)}
            />
          </div>
          
          {/* Voice Commands */}
          <div className="flex items-center justify-between">
            <Label htmlFor="voiceCommands" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Commands
            </Label>
            <Switch
              id="voiceCommands"
              checked={preferences.voiceCommands}
              onCheckedChange={(checked) => handlePreferenceChange('voiceCommands', checked)}
            />
          </div>
          
          {/* Text to Speech */}
          <div className="flex items-center justify-between">
            <Label htmlFor="textToSpeech" className="flex items-center gap-2">
              <Speaker className="h-4 w-4" />
              Text to Speech
            </Label>
            <Switch
              id="textToSpeech"
              checked={preferences.textToSpeech}
              onCheckedChange={(checked) => handlePreferenceChange('textToSpeech', checked)}
            />
          </div>
          
          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={resetPreferences}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilityMenu;
