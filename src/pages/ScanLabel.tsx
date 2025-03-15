
import React from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";

const ScanLabel = () => {
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
          <p className="text-muted-foreground">
            Point your camera at a QR code to scan it
          </p>
        </div>
        
        <QRCodeScanner />
      </motion.div>
    </Layout>
  );
};

export default ScanLabel;
