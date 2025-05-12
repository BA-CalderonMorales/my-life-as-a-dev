/**
 * TypewriterLoader.js - MVVM Implementation
 * 
 * This file ensures the Typewriter.js library is properly loaded
 * It runs before other scripts that depend on the library
 * 
 * Model: Represents data like CDN URLs
 * View: The script element in the DOM
 * ViewModel: Logic for loading scripts and handling errors
 */

// Check if we can use modules
const canUseModules = typeof document !== 'undefined' && 'noModule' in HTMLScriptElement.prototype;

// Use a self-invoking function to avoid polluting the global namespace
// but still support non-module environments
(function() {
  // Try to import the logger if available, otherwise use console
  let logger = console;
  
  if (canUseModules) {
    // We'll try to dynamically import the logger module
    import('./logger.js').then(module => {
      logger = module.defaultLogger.setModule('typewriterLoader');
      initializeLoader();
    }).catch(() => {
      // If import fails, use console and proceed
      initializeLoader();
    });
  } else {
    initializeLoader();
  }
  
  function initializeLoader() {
    const loaderController = new TypewriterLoaderController();
    loaderController.initialize();
  }

  // ================ MODELS ================

  /**
   * TypewriterCdnModel - Manages data about CDN URLs
   */
  class TypewriterCdnModel {
    constructor() {
      this.cdnUrls = [
        '/assets/js/vendor/typewriter.min.js'
      ];
    }

    getUrls() {
      return [...this.cdnUrls]; // Return a copy to prevent modification
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

    initialize() {
      // Check if Typewriter is already loaded
      if (window.Typewriter) {
        this.log('Typewriter.js is already loaded.');
        return true;
      }
      
      this.log('Loading Typewriter.js from CDN...');
      
      // Start the loading chain
      return this.loadFromCdns();
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
        this.log(`CDN ${index + 1} failed, trying next...`);
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
          this.logError(`Timeout loading Typewriter.js from ${url}`);
          reject(new Error(`Timeout loading script from ${url}`));
        }, 5000); // 5 second timeout
        
        script.onload = () => {
          clearTimeout(timeout);
          this.log(`Typewriter.js loaded successfully from ${url}`);
          
          // Additional check to ensure Typewriter is actually available
          if (window.Typewriter) {
            resolve(true);
          } else {
            this.logError(`Typewriter.js loaded from ${url} but Typewriter object is not available`);
            reject(new Error(`Typewriter object not available after script load from ${url}`));
          }
        };
        
        script.onerror = () => {
          clearTimeout(timeout);
          this.logError(`Failed to load Typewriter.js from ${url}`);
          reject(new Error(`Failed to load script from ${url}`));
        };
        
        document.head.appendChild(script);
      });
    }
    
    log(message) {
      if (logger.info) {
        logger.info(message, 'loadScript');
      } else {
        console.log(message);
      }
    }
    
    logError(message) {
      if (logger.error) {
        logger.error(message, 'loadScript');
      } else {
        console.error(message);
      }
    }
  }

  // ================ CONTROLLER ================

  /**
   * TypewriterLoaderController - Coordinates the loading process
   */
  class TypewriterLoaderController {
    constructor() {
      this.model = new TypewriterCdnModel();
      this.viewModel = new TypewriterLoaderViewModel(this.model);
    }
    
  initialize() {
    this.viewModel.initialize()
      .then(success => {
        if (success && window.Typewriter) {
          // Signal that Typewriter is ready by dispatching an event
          const event = new CustomEvent('typewriter:loaded', { 
            detail: { source: 'CDN' } 
          });
          document.dispatchEvent(event);
          
          if (logger.info) {
            logger.info('Typewriter.js loaded and ready', 'initialize');
          } else {
            console.log('Typewriter.js loaded and ready');
          }
        }
      })
      .catch(error => {
        // Signal that Typewriter failed to load
        const event = new CustomEvent('typewriter:failed', { 
          detail: { error: error.message } 
        });
        document.dispatchEvent(event);
        
        if (logger.error) {
          logger.error('All attempts to load Typewriter.js failed', 'initialize', error);
        } else {
          console.error('All attempts to load Typewriter.js failed:', error);
        }
        
        // Load the fallback manually
        this.loadFallback();
      });
  }
  
  loadFallback() {
    if (logger.info) {
      logger.info('Loading Typewriter fallback...', 'loadFallback');
    } else {
      console.log('Loading Typewriter fallback...');
    }
    
    // Create a simple fallback implementation if loading failed
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
      };
      
      // Signal that we've loaded the fallback
      const event = new CustomEvent('typewriter:loaded', { 
        detail: { source: 'fallback' } 
      });
      document.dispatchEvent(event);
    }
  }
  }

})();
