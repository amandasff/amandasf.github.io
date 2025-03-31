
import React from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";

const ScanLabel = () => {
  return (
    <Layout pageName="Scan Label">
      <Header />
      
      <motion.div 
        className="space-y-6 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-2 mb-4">
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
