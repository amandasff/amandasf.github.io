
import React from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScanLabel = () => {
  const navigate = useNavigate();
  
  return (
    <Layout pageName="Scan Label">
      <Header />
      
      <motion.div 
        className="space-y-6 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Close button for the entire page */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-0 z-10"
          onClick={() => navigate(-1)}
          aria-label="Close scanner and go back"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-xl font-bold sr-only">Scan QR Code Label</h1>
          <p className="text-muted-foreground font-medium text-lg">
            Point your camera at a QR code to scan it
          </p>
        </div>
        
        <QRCodeScanner />
      </motion.div>
    </Layout>
  );
};

export default ScanLabel;
