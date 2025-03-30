
import React from 'react';
import { motion } from 'framer-motion';
import AccessibilityControls from '@/components/AccessibilityControls';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <motion.div
      className="container mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
      {/* AccessibilityControls is now rendered via the Layout component */}
      <AccessibilityControls />
    </motion.div>
  );
};

export default Layout;
