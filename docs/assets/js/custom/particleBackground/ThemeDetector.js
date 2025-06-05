/**
 * ThemeDetector.js
 * Handles theme detection and theme change events
 */

import { defaultLogger } from '../logger.js';

// Module specific logger
const logger = defaultLogger.setModule('ThemeDetector');

class ThemeDetector {
  /**
   * Creates a new theme detector
   * @param {Function} onThemeChange - Callback function when theme changes
   */
  constructor(onThemeChange) {
    this.onThemeChange = onThemeChange;
    this.isDarkMode = this.detectDarkMode();
    this.setupListeners();
  }

  /**
   * Detects if dark mode is currently enabled
   * @returns {boolean} True if dark mode is enabled
   */
  detectDarkMode() {
    const htmlScheme = document.documentElement.getAttribute('data-md-color-scheme');
    const bodyScheme = document.body.getAttribute('data-md-color-scheme');
    return (htmlScheme === 'slate' || bodyScheme === 'slate');
  }

  /**
   * Set up listeners for theme changes
   */
  setupListeners() {
    // Direct event listener for the theme toggle button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.md-header__button[data-md-component="palette"]')) {
        logger.debug('Theme button click detected', 'setupListeners');

        // Wait for theme to apply then update
        setTimeout(() => {
          this.checkTheme();
        }, 100);
      }
    });
    
    // MutationObserver approach as backup
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
           (mutation.attributeName === 'data-md-color-scheme' || 
            mutation.attributeName === 'class')) {
          // Allow time for theme change to fully apply
          setTimeout(() => this.checkTheme(), 100);
        }
      });
    });
    
    // Start observing both html and body elements
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['data-md-color-scheme', 'class']
    });
    
    observer.observe(document.body, { 
      attributes: true,
      attributeFilter: ['data-md-color-scheme', 'class']
    });
    
    // Check for initial theme after DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.checkTheme();
    });
  }

  /**
   * Check the current theme and trigger callback if changed
   */
  checkTheme() {
    const currentDarkMode = this.detectDarkMode();
    if (currentDarkMode !== this.isDarkMode) {
      this.isDarkMode = currentDarkMode;
      if (this.onThemeChange) {
        this.onThemeChange(this.isDarkMode);
      }
    }
    return this.isDarkMode;
  }
  
  /**
   * Get the current dark mode state
   * @returns {boolean} True if dark mode is enabled
   */
  isDark() {
    return this.isDarkMode;
  }
}

export default ThemeDetector;