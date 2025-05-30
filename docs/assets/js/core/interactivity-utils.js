import { Logger } from './logger.js';  // Use named import instead of default import

const logger = new Logger('interactivity-utils');

/**
 * Utility functions for interactive elements
 * Core module for handling common interaction patterns
 */
class InteractivityUtils {
  /**
   * Determine if the device supports touch events
   */
  static isTouchDevice() {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 ||
           navigator.msMaxTouchPoints > 0;
  }

  /**
   * Detect reduced motion preference
   */
  static prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Throttle function to limit how often a function is called
   */
  static throttle(callback, delay = 100) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback.apply(this, args);
      }
    };
  }

  /**
   * Debounce function to delay execution until after a period of inactivity
   */
  static debounce(callback, delay = 100) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback.apply(this, args);
      }, delay);
    };
  }

  /**
   * Create an IntersectionObserver to detect when elements enter the viewport
   */
  static createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
  }

  /**
   * Add smooth reveal animation to elements as they enter the viewport
   */
  static addSmoothReveal(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    logger.debug(`Setting up smooth reveal for ${elements.length} elements`);
    
    const defaults = {
      threshold: 0.2,
      once: true,
      className: 'is-visible',
      delay: 0
    };

    const settings = { ...defaults, ...options };
    
    const observer = this.createIntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add(settings.className);
            if (settings.once) {
              observer.unobserve(entry.target);
            }
          }, settings.delay);
        } else if (!settings.once) {
          entry.target.classList.remove(settings.className);
        }
      });
    }, { threshold: settings.threshold });
    
    elements.forEach(element => observer.observe(element));
    
    return observer;
  }
}

// Export as default
export default InteractivityUtils;