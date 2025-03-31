
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import QRCodeScanner from "@/components/QRCodeScanner";
import { motion } from "framer-motion";
import { announcePageNavigation } from "@/utils/accessibility";
import { useIsMobile } from "@/hooks/use-mobile";

const ScanLabel = () => {
  const isMobile = useIsMobile();
  
  // Announce page navigation when component mounts
  useEffect(() => {
    announcePageNavigation("Scan Label");
    document.title = "Scan Label - QR Label Reader";
    
    // Unlock audio context for iOS - needs user interaction
    const unlockAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log("AudioContext unlocked");
          }).catch(console.error);
        }
      }
      
      // Create and immediately play a silent audio element
      try {
        const silentAudio = new Audio();
        silentAudio.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAABDAAAJcQANDQ0NDRoaGhoaKCgoKCg1NTU1NUNDQ0NDUFBQUFBeXl5eXmtra2trd3d3d3eEhISEhJKSkpKSn5+fn5+srKysrLm5ubm5x8fHx8fU1NTU1OHh4eHh7+/v7+/8/Pz8/P///////////////wAAAABMYXZjNTguMTMAAAAAAAAAAAAAAAAkAkAAAAAAAAAJcbU6v/UAAAAAAAAAAAAAAAAAAAD/++DEAAAIoAPp5AAAIisBfLyAAARpwAAQAYUIECBAQQBBAQIED/ggIECBAgQIECBAgQN+BAQIECBAgQIECBAgb8ECBAgQIECBAgQIEDfggIECBAgQIECBAgQN+CBAQIECBAgQIECBA34ECBAgQIECBAgQIEDfgQIECBAgQIECBAgQEAQAAAAAAAAAQFHCOcK5xoP4uLm5uidyUuQHwfPxOtGM7iYP4uHm5O+uO6M3bkdxcHx8XN3KxXU7GZnckR0B8XNyd9cd0ZtdMG//5YAAAAsQAAABgSj/++DEBAAJUAHZ+AAAIVAJ48gAAACQMDXjGHKchmGYdjmSE1LBkCw7BkDUCQJAaDIGhyBoFgaA0EQJAaCIEgSAoEgRBMCQFAkBIIgCfxQVHkWAkCQLAkAwJAkCQDAMAwFAUAT+AADAMAQA";
        silentAudio.volume = 0.01;
        const playPromise = silentAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log("Silent audio played successfully to unlock audio");
            silentAudio.pause();
            silentAudio.remove();
          }).catch(error => {
            console.log("Silent audio play failed:", error);
          });
        }
      } catch (e) {
        console.error("Error playing silent audio:", e);
      }
      
      // Remove the event listeners
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };
    
    // Add event listeners for user interaction
    document.addEventListener("touchstart", unlockAudio, { once: true });
    document.addEventListener("click", unlockAudio, { once: true });
    
    return () => {
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };
  }, []);

  return (
    <Layout>
      <Header />
      
      <motion.div 
        className={`space-y-6 ${isMobile ? "px-0" : "px-4"}`}
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
