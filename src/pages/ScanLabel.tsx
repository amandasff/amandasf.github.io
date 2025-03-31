
import React from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
        {/* Back button - positioned at top left for better accessibility */}
        <Button
          variant="outline"
          size="sm"
          className="absolute left-0 top-0 z-10 mb-4"
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-xs">Back</span>
        </Button>
        
        <div className="text-center space-y-2 mb-4 pt-12">
          <h1 className="text-xl font-bold">Scan QR Code Label</h1>
          <p className="text-muted-foreground font-medium text-sm mt-2">
            Point your camera at a QR code to scan it
          </p>
        </div>
        
        <QRCodeScanner />
      </motion.div>
    </Layout>
  );
};

export default ScanLabel;
