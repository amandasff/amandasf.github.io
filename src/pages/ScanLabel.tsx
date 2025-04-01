
import React, { useState } from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Accessibility } from "lucide-react";
import { announceToScreenReader } from "@/utils/accessibility";
import { useToast } from "@/hooks/use-toast";

const ScanLabel = () => {
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const { toast } = useToast();

  const toggleAccessibilityMode = () => {
    const newMode = !accessibilityMode;
    setAccessibilityMode(newMode);
    
    if (newMode) {
      announceToScreenReader("Accessibility mode enabled");
      toast({
        title: "Accessibility mode enabled",
        description: "Enhanced features for accessibility are now active"
      });
    } else {
      announceToScreenReader("Accessibility mode disabled");
      toast({
        title: "Accessibility mode disabled",
        description: "Standard mode is now active"
      });
    }
  };

  return (
    <Layout>
      <Header />
      
      <motion.div 
        className="space-y-6 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-2 mb-4">
          <p className="text-muted-foreground">
            Point your camera at a QR code to scan it
          </p>
        </div>
        
        <QRCodeScanner accessibilityMode={accessibilityMode} />
        
        {/* Accessibility button positioned in the corner */}
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-md bg-background z-50"
          onClick={toggleAccessibilityMode}
          aria-label={accessibilityMode ? "Disable accessibility mode" : "Enable accessibility mode"}
        >
          <Accessibility className={accessibilityMode ? "text-primary" : ""} />
        </Button>
      </motion.div>
    </Layout>
  );
};

export default ScanLabel;
