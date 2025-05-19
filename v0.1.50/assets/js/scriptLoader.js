/**
 * Script Loader - Lightweight utility for dynamically loading scripts
 * This file is kept as minimal as possible as most modules are loaded via ES modules
 */

(function() {
  // Only define the loader if it doesn't already exist
  if (window.scriptLoader) return;
  
  // Create minimal API for loading non-module scripts when needed
  window.scriptLoader = {
    /**
     * Load a script element
     * @param {string} src - Script URL
     * @param {Object} options - Additional options (async, defer, type)
     * @returns {Promise} - Resolves when script is loaded
     */
    loadScript: function(src, options = {}) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        
        if (options.type) script.type = options.type;
        if (options.defer) script.defer = options.defer;
        if (options.async) script.async = options.async;
        
        script.onload = resolve;
        script.onerror = reject;
        
        document.head.appendChild(script);
      });
    }
  };
})();