
// Accessibility utilities

// Function to announce a message to screen readers
export const announceToScreenReader = (message: string, priority = 'polite'): void => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.setAttribute('class', 'sr-only');
  
  document.body.appendChild(announcer);
  
  // Wait for the DOM to update
  setTimeout(() => {
    announcer.textContent = message;
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 3000);
  }, 100);
};

// Function to provide haptic feedback if available
export const provideHapticFeedback = (): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

// Function to speak a message
export const speak = (message: string, interrupt = false): void => {
  if ('speechSynthesis' in window) {
    if (interrupt) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }
};

// Function to set up voice command listener
export const setupVoiceCommands = (commands: Record<string, () => void>): void => {
  if (!('webkitSpeechRecognition' in window)) {
    console.error('Speech recognition not supported');
    return;
  }
  
  // @ts-ignore - using webkit API which TypeScript doesn't know about
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  
  recognition.onresult = (event: any) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.trim().toLowerCase();
    
    Object.entries(commands).forEach(([command, action]) => {
      if (transcript.includes(command.toLowerCase())) {
        action();
      }
    });
  };
  
  recognition.onerror = (event: any) => {
    console.error('Speech recognition error', event.error);
  };
  
  recognition.start();
};

// Function to make an element focusable
export const makeFocusable = (element: HTMLElement): void => {
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '0');
  }
};

// Function to trap focus within an element (for modals)
export const trapFocus = (element: HTMLElement): () => void => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstFocusable.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Fixed text size functions to properly increase and decrease font size
// Function to toggle high contrast mode
export const toggleHighContrast = (): void => {
  document.body.classList.toggle('high-contrast-mode');
  const isHighContrast = document.body.classList.contains('high-contrast-mode');
  localStorage.setItem('highContrast', isHighContrast.toString());
  announceToScreenReader(`High contrast mode ${isHighContrast ? 'enabled' : 'disabled'}`);
};

// Function to get current font size
const getCurrentFontSize = (): number => {
  const fontSize = localStorage.getItem('fontSize');
  return fontSize ? parseFloat(fontSize) : 16; // Default browser font size is usually 16px
};

// Function to increase text size
export const increaseTextSize = (): void => {
  const currentSize = getCurrentFontSize();
  const newSize = currentSize * 1.1; // Increase by 10%
  document.documentElement.style.fontSize = `${newSize}px`;
  localStorage.setItem('fontSize', newSize.toString());
  announceToScreenReader('Text size increased');
};

// Function to decrease text size
export const decreaseTextSize = (): void => {
  const currentSize = getCurrentFontSize();
  const newSize = currentSize * 0.9; // Decrease by 10%
  document.documentElement.style.fontSize = `${newSize}px`;
  localStorage.setItem('fontSize', newSize.toString());
  announceToScreenReader('Text size decreased');
};

// Function to reset text size
export const resetTextSize = (): void => {
  const defaultSize = 16;
  document.documentElement.style.fontSize = `${defaultSize}px`;
  localStorage.setItem('fontSize', defaultSize.toString());
  announceToScreenReader('Text size reset to default');
};

// Function to enable focus indicators
export const enableFocusIndicators = (): void => {
  document.body.classList.add('focus-visible-enabled');
  announceToScreenReader('Focus indicators enabled');
};

// Function to create accessible keyboard shortcuts
export const setupAccessibilityShortcuts = (): void => {
  document.addEventListener('keydown', (e) => {
    // Use Alt + combinations for accessibility shortcuts
    if (e.altKey) {
      switch(e.key) {
        case '1': // Alt + 1: Go to home
          window.location.href = '/';
          e.preventDefault();
          break;
        case '2': // Alt + 2: Go to create label
          window.location.href = '/create';
          e.preventDefault();
          break;
        case '3': // Alt + 3: Go to scan label
          window.location.href = '/scan';
          e.preventDefault();
          break;
        case '4': // Alt + 4: Go to my labels
          window.location.href = '/labels';
          e.preventDefault();
          break;
        case 'c': // Alt + C: Toggle high contrast
          toggleHighContrast();
          e.preventDefault();
          break;
        case '+': // Alt + +: Increase text size
          increaseTextSize();
          e.preventDefault();
          break;
        case '-': // Alt + -: Decrease text size
          decreaseTextSize();
          e.preventDefault();
          break;
        case '0': // Alt + 0: Reset text size
          resetTextSize();
          e.preventDefault();
          break;
      }
    }
  });
};

// Function to initialize accessibility settings on page load
export const initializeAccessibilitySettings = (): void => {
  // Restore high contrast setting
  const highContrast = localStorage.getItem('highContrast') === 'true';
  if (highContrast) {
    document.body.classList.add('high-contrast-mode');
  }
  
  // Restore font size setting
  const fontSize = localStorage.getItem('fontSize');
  if (fontSize) {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }
  
  // Enable focus indicators by default
  enableFocusIndicators();
  
  // Setup keyboard shortcuts
  setupAccessibilityShortcuts();
  
  // Add skip to content link
  addSkipToContentLink();
};

// Function to add a skip to content link
export const addSkipToContentLink = (): void => {
  const skipLink = document.createElement('a');
  skipLink.textContent = 'Skip to content';
  skipLink.href = '#main-content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
};

// Function to announce page navigation
export const announcePageNavigation = (pageName: string): void => {
  announceToScreenReader(`Navigated to ${pageName} page`);
};

// Create a screen reader only element to announce dynamic content changes
export const createDynamicAnnouncer = (): HTMLDivElement => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  document.body.appendChild(announcer);
  return announcer;
};
