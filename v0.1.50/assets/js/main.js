/**
 * Main JavaScript entry point
 * - Centralized module loading system
 * - Handles dynamic imports based on page requirements
 * - Optimizes performance by loading only what's needed
 */
import { defaultLogger } from './custom/logger/index.js';
import './importmap.js';
import { moduleRegistry } from './modules.js';

// Initialize scriptLoader utility
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

// Initialize logger
const logger = defaultLogger.setModule('main');
logger.info('Initializing main application');

// Feature detection
const features = {
  isLandingPage: document.body.classList.contains('landing-page') || 
                 document.documentElement.classList.contains('landing-page') ||
                 !!document.querySelector('.home-page-wrapper') || 
                 !!document.querySelector('.home-page'),
  supportsWebGL: (function() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e) {
      return false;
    }
  })(),
  isDevelopment: window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1',
  hasParticleElements: !!document.querySelector('[data-particles]')
};

logger.debug('Feature detection:', features);

// Functions to determine which modules to load
function shouldLoadModule(conditions) {
  if (!conditions || conditions.length === 0) return true;
  
  return conditions.every(condition => {
    // Handle negated conditions
    if (condition.startsWith('!')) {
      const feature = condition.substring(1);
      return !features[feature];
    }
    return features[condition];
  });
}

// Collect modules to load based on features
const modulesToLoad = [];

// Add core modules
Object.entries(moduleRegistry.core || {}).forEach(([name, module]) => {
  if (shouldLoadModule(module.conditions)) {
    modulesToLoad.push(module.path);
    logger.debug(`Added core module: ${name}`);
  }
});

// Add UI modules
Object.entries(moduleRegistry.ui || {}).forEach(([name, module]) => {
  if (shouldLoadModule(module.conditions)) {
    modulesToLoad.push(module.path);
    logger.debug(`Added UI module: ${name}`);
  }
});

// Add interaction modules
Object.entries(moduleRegistry.interaction || {}).forEach(([name, module]) => {
  if (shouldLoadModule(module.conditions)) {
    modulesToLoad.push(module.path);
    logger.debug(`Added interaction module: ${name}`);
  }
});

// Load modules
logger.info(`Loading ${modulesToLoad.length} modules`);
Promise.all(modulesToLoad.map(modulePath => 
  import(`./${modulePath}`).catch(error => {
    logger.error(`Failed to load module ${modulePath}:`, error);
    // Return a placeholder to prevent Promise.all from failing entirely
    return { loadFailed: true, error, path: modulePath };
  })
)).then((results) => {
  // Count successfully loaded modules
  const loadedCount = results.filter(result => !result.loadFailed).length;
  const failedCount = results.filter(result => result.loadFailed).length;
  
  if (failedCount > 0) {
    logger.warn(`${loadedCount} modules loaded successfully, ${failedCount} failed to load`);
  } else {
    logger.info('All modules loaded successfully');
  }
}).catch(error => {
  logger.error('Error loading modules:', error);
});

// Load page-specific components 
document.querySelectorAll('[data-component]').forEach(element => {
  const componentName = element.dataset.component;
  if (componentName) {
    logger.info(`Loading component: ${componentName}`);
    import(`./components/${componentName}/index.js`)
      .catch(error => 
        logger.error(`Failed to load component ${componentName}:`, error)
      );
  }
});

// Export main application
export default {
  logger,
  features
};
