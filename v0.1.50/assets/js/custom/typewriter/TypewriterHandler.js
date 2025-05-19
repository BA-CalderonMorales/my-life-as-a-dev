/**
 * TypewriterHandler.js - Unified MVVM Implementation for Typewriter functionality
 * 
 * Handles both loading the Typewriter library and initializing typewriter instances
 * Model: Represents data for typewriter (strings, CDN URLs)
 * View: The UI elements that will display typewriter effects
 * ViewModel: Coordinates typewriter animation and library loading
 */

import { defaultLogger } from '../logger/index.js';

// Initialize module logger
const logger = defaultLogger.setModule('typewriter');

/**
 * TypewriterHandler - Main class to handle typewriter functionality
 */
class TypewriterHandler {
  constructor() {
    this.cdnModel = new TypewriterCdnModel();
    this.stringsModel = new TypewriterStringsModel();
    this.loaderViewModel = new TypewriterLoaderViewModel(this.cdnModel);
    this.typewriterViewModel = new TypewriterViewModel(this.stringsModel);
    
    // Flag to track if Typewriter.js is loaded
    this.isLoaded = false;
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the TypewriterHandler
   */
  init() {
    // Set up event listeners for when typewriter library is loaded
    document.addEventListener('typewriter:loaded', (event) => {
      logger.info(`Typewriter loaded from ${event.detail.source}`);
      this.isLoaded = true;
      this.initializeTypewriters();
    });
    
    document.addEventListener('typewriter:failed', (event) => {
      logger.error(`Typewriter failed to load: ${event.detail.error}`);
      this.loadFallback();
    });
    
    // Document ready check
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadTypewriterLibrary());
    } else {
      this.loadTypewriterLibrary();
    }
  }
  
  /**
   * Load the Typewriter library
   */
  loadTypewriterLibrary() {
    // Check if Typewriter is already loaded
    if (window.Typewriter) {
      logger.info('Typewriter.js is already loaded.');
      this.isLoaded = true;
      this.initializeTypewriters();
      return;
    }
    
    // Load from CDN
    logger.info('Loading Typewriter.js library...');
    this.loaderViewModel.loadFromCdns()
      .then(() => {
        logger.info('Typewriter.js loaded successfully');
        this.isLoaded = true;
        this.initializeTypewriters();
      })
      .catch(error => {
        logger.error(`Failed to load Typewriter.js: ${error.message}`);
        this.loadFallback();
      });
  }
  
  /**
   * Initialize all typewriter elements on the page
   */
  initializeTypewriters() {
    // Find all elements with typewriter class
    const elements = document.querySelectorAll('.typewriter, [data-typewriter]');
    
    if (elements.length === 0) {
      logger.debug('No typewriter elements found on page');
      return;
    }
    
    logger.info(`Initializing ${elements.length} typewriter elements`);
    
    // Initialize each element
    elements.forEach((element, index) => {
      this.typewriterViewModel.initializeTypewriter(element, index);
    });
  }
  
  /**
   * Load fallback implementation if Typewriter library fails to load
   */
  loadFallback() {
    logger.info('Loading Typewriter fallback...');
    
    // Create a simple fallback implementation
    if (!window.Typewriter) {
      window.Typewriter = function(element, options) {
        const strings = options.strings || [''];
        if (element) {
          // Simple non-animated implementation - just show the first string
          element.textContent = strings[0].split('|')[0];
          
          // Add a cursor element
          const cursor = document.createElement('span');
          cursor.className = options.cursorClassName || 'Typewriter__cursor';
          cursor.textContent = options.cursor || '|';
          element.after(cursor);
        }
        
        // Return an object with empty methods to prevent errors
        return {
          start: () => {},
          stop: () => {},
          pauseFor: () => { return this; },
          typeString: () => { return this; },
          deleteAll: () => { return this; },
          deleteChars: () => { return this; },
          callFunction: () => { return this; }
        };
      };
      
      // Signal that we've loaded the fallback
      const event = new CustomEvent('typewriter:loaded', { 
        detail: { source: 'fallback' } 
      });
      document.dispatchEvent(event);
    }
  }
}

// ================ MODELS ================

/**
 * TypewriterCdnModel - Manages data about CDN URLs
 */
class TypewriterCdnModel {
  constructor() {
    this.cdnUrls = [
      './assets/js/vendor/typewriter.min.js',
      'https://unpkg.com/typewriter-effect@2.19.0/dist/typewriter.min.js'
    ];
  }

  getUrls() {
    return [...this.cdnUrls]; // Return a copy to prevent modification
  }
}

/**
 * TypewriterStringsModel - Manages typewriter strings data
 */
class TypewriterStringsModel {
  constructor() {
    this._defaultStrings = [
      'Welcome to My Life as a Dev',
      'Exploring code and technology',
      'Sharing developer insights',
      'Building a better web together'
    ];
  }

  getStrings(element) {
    return element.getAttribute('data-strings') ? 
           element.getAttribute('data-strings').split('|') : 
           this._defaultStrings;
  }
  
  getDelay(element) {
    return parseInt(element.getAttribute('data-delay') || '2000', 10);
  }
  
  getSpeed(element) {
    return parseInt(element.getAttribute('data-speed') || '50', 10);  
  }
}

// ================ VIEWMODELS ================

/**
 * TypewriterLoaderViewModel - Handles loading script logic
 */
class TypewriterLoaderViewModel {
  constructor(model) {
    this.model = model;
  }
  
  loadFromCdns() {
    const urls = this.model.getUrls();
    return this.loadSequentially(urls);
  }
  
  loadSequentially(urls, index = 0) {
    if (index >= urls.length) {
      return Promise.reject(new Error('All CDN attempts failed'));
    }
    
    return this.loadScript(urls[index]).catch(() => {
      logger.warn(`CDN ${index + 1} failed, trying next...`);
      return this.loadSequentially(urls, index + 1);
    });
  }
  
  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        logger.error(`Timeout loading Typewriter.js from ${url}`);
        reject(new Error(`Timeout loading script from ${url}`));
      }, 5000); // 5 second timeout
      
      script.onload = () => {
        clearTimeout(timeout);
        logger.info(`Typewriter.js loaded successfully from ${url}`);
        
        // Additional check to ensure Typewriter is actually available
        if (window.Typewriter) {
          resolve(true);
        } else {
          logger.error(`Typewriter.js loaded from ${url} but Typewriter object is not available`);
          reject(new Error(`Typewriter object not available after script load from ${url}`));
        }
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        logger.error(`Failed to load Typewriter.js from ${url}`);
        reject(new Error(`Failed to load script from ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }
}

/**
 * TypewriterViewModel - Handles typewriter animation logic
 */
class TypewriterViewModel {
  constructor(model) {
    this.model = model;
    this.instances = [];
  }
  
  initializeTypewriter(element, index) {
    if (!window.Typewriter) {
      logger.error('Typewriter library not loaded');
      return;
    }
    
    try {
      const strings = this.model.getStrings(element);
      const delay = this.model.getDelay(element);
      const speed = this.model.getSpeed(element);
      
      logger.debug(`Initializing typewriter #${index} with ${strings.length} strings`);
      
      // Create typewriter instance
      const instance = new window.Typewriter(element, {
        strings,
        autoStart: true,
        loop: true,
        delay,
        deleteSpeed: speed,
        pauseFor: delay,
        cursor: '|',
        cursorClassName: 'typewriter-cursor'
      });
      
      // Store the instance for later reference
      this.instances[index] = instance;
      
      return instance;
    } catch (error) {
      logger.error(`Error initializing typewriter: ${error.message}`);
      // Provide fallback
      element.textContent = this.model.getStrings(element)[0];
      return null;
    }
  }
}

export default TypewriterHandler;
