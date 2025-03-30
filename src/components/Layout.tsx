
import React from 'react';
import { motion } from 'framer-motion';
import AccessibilityProvider from '@/components/AccessibilityProvider';

interface LayoutProps {
  children: React.ReactNode;
  pageName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, pageName = 'Page' }) => {
  return (
    <AccessibilityProvider pageName={pageName}>
      <motion.div
        className="container mx-auto py-8 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AccessibilityProvider>
  );
};

export default Layout;
