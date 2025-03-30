
import React, { ReactNode, useEffect } from 'react';
import AccessibilityControls from '@/components/AccessibilityControls';
import { 
  announcePageNavigation,
  enableFocusIndicators
} from '@/utils/accessibility';

interface AccessibilityProviderProps {
  children: ReactNode;
  pageName: string;
}

const AccessibilityProvider = ({ children, pageName }: AccessibilityProviderProps) => {
  useEffect(() => {
    // Announce page navigation
    announcePageNavigation(pageName);
    
    // Set document title for screen readers
    document.title = `${pageName} - Accessible QR Labels`;
    
    // Ensure focus indicators are enabled
    enableFocusIndicators();
    
  }, [pageName]);

  return (
    <>
      {children}
      <AccessibilityControls />
    </>
  );
};

export default AccessibilityProvider;
