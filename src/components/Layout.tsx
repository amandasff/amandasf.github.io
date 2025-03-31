
import React from 'react';
import { motion } from 'framer-motion';
import AccessibilityControls from '@/components/AccessibilityControls';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      className="container mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
      <div className={`${isMobile ? 'fixed bottom-4 right-4 z-50' : ''}`}>
        <AccessibilityControls />
      </div>
    </motion.div>
  );
};

export default Layout;
