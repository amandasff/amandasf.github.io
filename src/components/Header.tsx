
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();
  
  // Determine the title based on the current path
  const getTitle = () => {
    if (title) return title;
    
    switch (location.pathname) {
      case '/':
        return 'Audio Labels';
      case '/create':
        return 'Create Label';
      case '/scan':
        return 'Scan Label';
      case '/labels':
        return 'My Labels';
      default:
        return 'Audio Labels';
    }
  };

  return (
    <header className="py-4 mb-4 w-full">
      <AnimatePresence mode="wait">
        <motion.h1
          key={location.pathname}
          className="text-2xl font-bold text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {getTitle()}
        </motion.h1>
      </AnimatePresence>
    </header>
  );
};

export default Header;
