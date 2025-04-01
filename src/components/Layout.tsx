
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, PlusCircle, Search, LayoutList, Settings } from 'lucide-react';
import AccessibilityMenu from './AccessibilityMenu';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
  
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <motion.main 
        className="flex-1 pt-4 pb-20 px-4 max-w-md mx-auto w-full"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        key={location.pathname}
      >
        {children}
      </motion.main>
      
      {/* Accessibility button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 h-10 w-10 rounded-full shadow-md z-50"
        onClick={() => setAccessibilityMenuOpen(true)}
        aria-label="Accessibility options"
      >
        <Settings className="h-5 w-5" />
      </Button>
      
      {/* Accessibility Menu Dialog */}
      <AccessibilityMenu
        open={accessibilityMenuOpen}
        onOpenChange={setAccessibilityMenuOpen}
      />
      
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border backdrop-blur-lg z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <NavItem to="/" icon={<Home />} label="Home" isActive={location.pathname === '/'} />
          <NavItem to="/create" icon={<PlusCircle />} label="Create" isActive={location.pathname === '/create'} />
          <NavItem to="/scan" icon={<Search />} label="Scan" isActive={location.pathname === '/scan'} />
          <NavItem to="/labels" icon={<LayoutList />} label="My Labels" isActive={location.pathname === '/labels'} />
        </div>
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center px-2 py-1 text-sm transition-all duration-150 ease-in-out rounded-md ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
      aria-label={label}
    >
      <div className="relative">
        {isActive && (
          <motion.div 
            layoutId="navIndicator" 
            className="absolute inset-0 bg-primary/10 rounded-full -m-1 p-1"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <div className="relative z-10">{icon}</div>
      </div>
      <span className="mt-1 text-xs font-medium">{label}</span>
    </Link>
  );
};

export default Layout;
