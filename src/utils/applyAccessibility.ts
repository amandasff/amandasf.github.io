
import { initializeAccessibilitySettings } from "./accessibility";

/**
 * Initialize the application's accessibility features
 */
export const applyAccessibility = () => {
  // Apply all accessibility initializations
  document.addEventListener('DOMContentLoaded', () => {
    initializeAccessibilitySettings();
    
    // Add accessibility to ShadCN components
    enhanceShadcnComponents();
  });
};

/**
 * Enhance ShadCN UI components with better accessibility
 */
const enhanceShadcnComponents = () => {
  // Add high contrast compatible styles
  const style = document.createElement('style');
  style.innerHTML = `
    .high-contrast-mode .ring {
      border: 2px solid white !important;
    }
    
    .high-contrast-mode [role="dialog"] {
      border: 3px solid white !important;
    }
    
    .high-contrast-mode button {
      min-height: 44px;
      min-width: 44px;
      padding: 10px 16px;
    }
    
    .high-contrast-mode input, 
    .high-contrast-mode select, 
    .high-contrast-mode textarea {
      border: 2px solid white !important;
      min-height: 44px;
    }
    
    .high-contrast-mode a {
      text-decoration: underline;
      padding: 4px;
    }
    
    /* Improve radiogroup */
    [role="radiogroup"] {
      padding: 8px;
    }
    
    /* Improve Switch component */
    [data-state] {
      min-width: 44px;
      min-height: 22px;
    }
  `;
  
  document.head.appendChild(style);
  
  // Apply ARIA attributes to elements that might need them
  const applyAriaAttributes = () => {
    // Find all cards and add role="region" if they don't have a role
    document.querySelectorAll('.card').forEach(card => {
      if (!card.hasAttribute('role')) {
        card.setAttribute('role', 'region');
      }
    });
    
    // Ensure buttons have accessible names
    document.querySelectorAll('button').forEach(button => {
      if (!button.textContent && !button.getAttribute('aria-label')) {
        // Try to find an icon and use its name
        const icon = button.querySelector('svg');
        if (icon && icon.classList.length > 0) {
          const iconName = Array.from(icon.classList)
            .find(c => c.startsWith('lucide-'))
            ?.replace('lucide-', '');
            
          if (iconName) {
            button.setAttribute('aria-label', iconName.replace('-', ' '));
          } else {
            button.setAttribute('aria-label', 'Button');
          }
        } else {
          button.setAttribute('aria-label', 'Button');
        }
      }
    });
  };
  
  // Run once and then observe DOM changes
  applyAriaAttributes();
  
  // Set up a mutation observer to apply ARIA attributes to dynamically added elements
  const observer = new MutationObserver((mutations) => {
    applyAriaAttributes();
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
};

// Call this function to initialize
applyAccessibility();

export default applyAccessibility;
