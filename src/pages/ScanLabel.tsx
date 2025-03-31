
import React from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const ScanLabel = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout pageName="Scan Label">
      <Header />
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-center space-y-2 flex-1">
            <h1 className="text-xl font-bold sr-only">Scan QR Code Label</h1>
            <p className="text-muted-foreground font-medium text-lg">
              Point your camera at a QR code to scan it
            </p>
          </div>
          
          <Button variant="outline" size="icon" asChild>
            <Link to="/" aria-label="Go to home page">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <QRCodeScanner />
      </motion.div>
    </Layout>
  );
};

export default ScanLabel;
