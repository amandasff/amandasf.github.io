
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";
import { announcePageNavigation } from "@/utils/accessibility";

const ScanLabel = () => {
  // Announce page navigation when component mounts
  useEffect(() => {
    announcePageNavigation("Scan Label");
    document.title = "Scan Label - QR Label Reader";
  }, []);

  return (
    <Layout>
      <Header />
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
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
