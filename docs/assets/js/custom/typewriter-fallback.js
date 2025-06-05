"use strict";
/**
 * TypewriterFallback.js - MVVM Implementation
 * 
 * Simple fallback typewriter effect in case the main library fails to load
 * 
 * Model: Represents the data (strings to display)
 * View: DOM elements for the typewriter effect
 * ViewModel: Logic for animating the text
 */

// Check if we can use modules
const canUseModules = (function() {
  try {
    new Function('import("")');
    return true;
  } catch (err) {
    return false;
  }
})();

// Use a self-invoking function to avoid polluting the global namespace
(function() {
  // Try to import the logger if available, otherwise use console
  let logger = console;
  
  if (canUseModules) {
    // We'll try to dynamically import the logger module
    import('./logger.js').then(module => {
      logger = module.defaultLogger.setModule('typewriterFallback');
      initializeFallback();
    }).catch(() => {
      // If import fails, use console and proceed
      initializeFallback();
    });
  } else {
    initializeFallback();
  }
  
  function initializeFallback() {
    // Listen for typewriter failed event (preferred method)
    document.addEventListener('typewriter:failed', function() {
      if (logger.info) {
        logger.info('Initializing typewriter fallback due to main library failure', 'initializeFallback');
      } else {
        console.log('Initializing typewriter fallback due to main library failure');
      }
      
      const fallbackController = new TypewriterFallbackController();
      fallbackController.initialize();
    });
    
    // Also use a timeout as a safety net
    window.addEventListener('load', function() {
      // Check if Typewriter is available
      if (!window.Typewriter) {
        setTimeout(function() {
          // Double-check after timeout
          if (!window.Typewriter) {
            if (logger.info) {
              logger.info('Initializing typewriter fallback after timeout', 'initializeFallback');
            } else {
              console.log('Initializing typewriter fallback after timeout');
            }
            
            const fallbackController = new TypewriterFallbackController();
            fallbackController.initialize();
          }
        }, 3000); // Wait 3 seconds to see if main typewriter initializes
      }
    });
  }

  // ================ MODELS ================

  /**
   * TypewriterFallbackModel - Manages typewriter strings and state
   */
  class TypewriterFallbackModel {
    constructor() {
      this.defaultStrings = [
        'Product-Minded Software Engineer', 
        'DevOps Transformation Specialist', 
        'Legacy Code Modernizer', 
        'Technical Mentor'
      ];
      this.currentStringIndex = 0;
      this.currentCharIndex = 0;
      this.isDeleting = false;
      this.typingSpeed = 75;
    }
    
    getStringsFromElement(element) {
      return element.getAttribute('data-strings') ? 
             element.getAttribute('data-strings').split('|') : 
             this.defaultStrings;
    }
    
    getCurrentString(strings) {
      return strings[this.currentStringIndex];
    }
    
    updateState(strings) {
      const currentString = strings[this.currentStringIndex];
      
      if (this.isDeleting) {
        // Deleting text
        this.currentCharIndex--;
        this.typingSpeed = 30; // Faster when deleting
      } else {
        // Adding text
        this.currentCharIndex++;
        this.typingSpeed = 75; // Slower when typing
      }
      
      // When to delete or move to next string
      if (!this.isDeleting && this.currentCharIndex === currentString.length) {
        // Pause at end of word before deleting
        this.typingSpeed = 1500;
        this.isDeleting = true;
      } else if (this.isDeleting && this.currentCharIndex === 0) {
        // Move to next string when deleted
        this.isDeleting = false;
        this.currentStringIndex = (this.currentStringIndex + 1) % strings.length;
        this.typingSpeed = 400; // Pause before typing next word
      }
      
      return {
        text: currentString.substring(0, this.currentCharIndex),
        speed: this.typingSpeed
      };
    }
  }

  // ================ VIEWMODELS ================

  /**
   * TypewriterFallbackViewModel - Handles animation and DOM manipulation
   */
  class TypewriterFallbackViewModel {
    constructor(model) {
      this.model = model;
      this.element = null;
      this.textSpan = null;
      this.cursor = null;
      this.strings = [];
      this.animationTimer = null;
    }
    
    initialize() {
      // Find the typewriter element
      this.element = document.querySelector('.typewriter-text');
      
      // Check if element exists and needs the fallback
      if (!this.element) {
        this.log('No typewriter element found', 'warn');
        return false;
      }
      
      if (this.element.classList.contains('typewriter-initialized')) {
        this.log('Typewriter already initialized, skipping fallback', 'info');
        return false;
      }
      
      if (this.element.textContent && this.element.textContent.trim() !== '') {
        this.log('Typewriter element already has content, skipping fallback', 'info');
        return false;
      }
      
      this.log('Main typewriter effect not detected. Using fallback implementation.', 'warn');
      
      // Get strings from element
      this.strings = this.model.getStringsFromElement(this.element);
      
      // Mark as initialized
      this.element.classList.add('typewriter-initialized');
      this.element.classList.add('typewriter-fallback');
      
      // Create DOM elements
      this.createElements();
      
      // Start typing
      this.startTyping();
      
      return true;
    }
    
    createElements() {
      // Add a custom cursor
      this.cursor = document.createElement('span');
      this.cursor.className = 'typewriter-fallback-cursor';
      this.cursor.textContent = '|';
      this.element.appendChild(this.cursor);
      
      // Text span where we'll add the typed content
      this.textSpan = document.createElement('span');
      this.textSpan.className = 'typewriter-fallback-text';
      this.element.insertBefore(this.textSpan, this.cursor);
    }
    
    startTyping() {
      this.typeNextChar();
    }
    
    typeNextChar() {
      // Get updated state from model
      const { text, speed } = this.model.updateState(this.strings);
      
      // Update DOM
      this.textSpan.textContent = text;
      
      // Schedule next update
      this.animationTimer = setTimeout(() => this.typeNextChar(), speed);
    }
    
    log(message, level = 'log') {
      const logMethod = logger[level] || console[level] || console.log;
      
      if (typeof logMethod === 'function') {
        if (logMethod === logger[level]) {
          logMethod.call(logger, message, 'typewriter-fallback');
        } else {
          logMethod(message);
        }
      }
    }
  }

  // ================ CONTROLLER ================

  /**
   * TypewriterFallbackController - Coordinates the fallback implementation
   */
  class TypewriterFallbackController {
    constructor() {
      this.model = new TypewriterFallbackModel();
      this.viewModel = new TypewriterFallbackViewModel(this.model);
    }
    
    initialize() {
      this.viewModel.initialize();
    }
  }
})();
