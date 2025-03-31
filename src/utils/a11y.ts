
// Main accessibility module that exports all accessibility functions
import {
  announceToScreenReader,
  provideHapticFeedback,
  speak,
  setupVoiceCommands,
  makeFocusable,
  trapFocus,
  toggleHighContrast,
  increaseTextSize,
  decreaseTextSize,
  resetTextSize,
  enableFocusIndicators,
  setupAccessibilityShortcuts,
  initializeAccessibilitySettings,
  addSkipToContentLink,
  announcePageNavigation,
  createDynamicAnnouncer
} from './accessibility';

import applyAccessibility from './applyAccessibility';

// Initialize accessibility
applyAccessibility();

// Export all functions
export {
  announceToScreenReader,
  provideHapticFeedback,
  speak,
  setupVoiceCommands,
  makeFocusable,
  trapFocus,
  toggleHighContrast,
  increaseTextSize,
  decreaseTextSize,
  resetTextSize,
  enableFocusIndicators,
  setupAccessibilityShortcuts,
  initializeAccessibilitySettings,
  addSkipToContentLink,
  announcePageNavigation,
  createDynamicAnnouncer
};

// Named export for the provider component
export { default as AccessibilityProvider } from '../components/AccessibilityProvider';
