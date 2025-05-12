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
        'https://cdn.jsdelivr.net/npm/typewriter-effect@2.19.0/dist/typewriter.min.js',
        'https://unpkg.com/typewriter-effect@2.19.0/dist/typewriter.min.js',
        'https://raw.githubusercontent.com/tameemsafi/typewriterjs/master/dist/typewriter.min.js'
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
        
        script.onload = () => {
          this.log(`Typewriter.js loaded successfully from ${url}`);
          resolve(true);
        };
        
        script.onerror = () => {
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
        .catch(error => {
          if (logger.error) {
            logger.error('All attempts to load Typewriter.js failed', 'initialize', error);
          } else {
            console.error('All attempts to load Typewriter.js failed:', error);
          }
        });
    }
  }

})();
