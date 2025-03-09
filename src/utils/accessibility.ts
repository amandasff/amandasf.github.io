
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
