
import React from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

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
        <Card className="p-4 bg-secondary border-2 border-primary/30">
          <p className="text-foreground text-lg font-medium text-center">
            Point your camera at a QR code to scan it
          </p>
        </Card>
        
        <QRCodeScanner />
      </motion.div>
    </Layout>
  );
};

export default ScanLabel;
