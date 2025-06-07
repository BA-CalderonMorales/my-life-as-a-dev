"use strict";
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

    // Bind handlers so they can be removed later
    this.handleClick = this.handleClick.bind(this);
    this.handleDOMLoaded = this.handleDOMLoaded.bind(this);
    this.handleMutations = this.handleMutations.bind(this);

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
      if (e.target.closest('.md-header__button[data-md-component="palette"]') ||
          e.target.closest('[data-md-component="palette"]')) {
        
        logger.debug('Theme button click detected', 'setupListeners');

        // Wait for theme to apply then update
        setTimeout(() => {
          this.checkTheme();
        }, 100);
      }
    });
    
    // MutationObserver approach as primary method
    this.observer = new MutationObserver(this.handleMutations);

    // Start observing both html and body elements
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme', 'class']
    });

    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme', 'class']
    });

    // Check for initial theme after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.handleDOMLoaded);
    } else {
      // DOM is already loaded
      setTimeout(() => this.checkTheme(), 100);
    }
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

  /**
   * Click handler for palette button
   * @param {Event} e
   */
  handleClick(e) {
    if (e.target.closest('.md-header__button[data-md-component="palette"]')) {
      console.log('Theme button click detected');
      setTimeout(() => {
        this.checkTheme();
      }, 100);
    }
  }

  /**
   * DOMContentLoaded handler
   */
  handleDOMLoaded() {
    this.checkTheme();
  }

  /**
   * Mutation observer callback
   * @param {MutationRecord[]} mutations
   */
  handleMutations(mutations) {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes' &&
        (mutation.attributeName === 'data-md-color-scheme' ||
          mutation.attributeName === 'class')
      ) {
        logger.debug('Theme mutation detected', 'handleMutations');
        setTimeout(() => this.checkTheme(), 50);
      }
    });
  }

  /**
   * Clean up event listeners and observers
   */
  dispose() {
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('DOMContentLoaded', this.handleDOMLoaded);

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export default ThemeDetector;
