
/**
 * MVVM Implementation for Site Interactivity
 * 
 * Model: Represents and manages the data
 * View: The UI elements
 * ViewModel: Transforms Model data for View and handles View events
 */

import { defaultLogger } from './logger.js';

// Initialize module logger
const logger = defaultLogger.setModule('typewriter');

// ================ MODELS ================

/**
 * TypewriterModel - Manages typewriter data
 */
class TypewriterModel {
  constructor(defaultStrings = []) {
    this._defaultStrings = defaultStrings;
  }

  getStrings(element) {
    return element.getAttribute('data-strings') ? 
           element.getAttribute('data-strings').split('|') : 
           this._defaultStrings;
  }
}

/**
 * TabModel - Manages tab data
 */
class TabModel {
  constructor() {
    this.tabSets = [];
  }

  initialize() {
    this.tabSets = Array.from(document.querySelectorAll('.tabbed-set'));
    return this.tabSets;
  }
}

/**
 * AnimationModel - Manages animation data
 */
class AnimationModel {
  constructor() {
    this.sections = [];
  }

  initialize() {
    this.sections = Array.from(document.querySelectorAll('.tabbed-set .tabbed-content section, .tabbed-set .tabbed-content .fade-in-section'));
    return this.sections;
  }
}

// ================ VIEWMODELS ================

/**
 * TypewriterViewModel - Manages typewriter logic
 */
class TypewriterViewModel {
  constructor(model) {
    this.model = model;
  }

  initialize(element) {
    // Using either window.Typewriter (global script tag) or Typewriter from CDN
    const TypewriterLib = window.Typewriter;
    
    logger.debug('Initializing typewriter on element', 'initialize');
    
    if (!element) {
      logger.warn('Typewriter initialization failed: Element is missing', 'initialize');
      return false;
    }
    
    if (!TypewriterLib) {
      // Don't log this as an error since we have a fallback mechanism
      logger.warn('Typewriter library is not loaded, will try fallback', 'initialize');
      
      // Listen for the typewriter:loaded event
      document.addEventListener('typewriter:loaded', () => {
        // Try initialization again after library is loaded
        setTimeout(() => this.initialize(element), 100);
      }, { once: true });
      
      return false;
    }

    try {
      // Remove any existing content that might interfere with the typewriter
      element.innerHTML = '';
      
      const strings = this.model.getStrings(element);
      logger.debug(`Typewriter strings: [${strings.join(', ')}]`, 'initialize');
      
      // Configure custom cursor to match our CSS
      const instance = new TypewriterLib(element, {
        strings: strings,
        autoStart: true,
        loop: true,
        delay: 75,
        deleteSpeed: 30,
        cursor: '|',
        cursorClassName: 'Typewriter__cursor',
        wrapperClassName: 'typewriter-wrapper'
      });
      
      // Store the instance on the element to access it later if needed
      element.typewriter = instance;
      
      // Add a class to indicate the typewriter is initialized
      element.classList.add('typewriter-initialized');
      
      logger.debug('Typewriter instance created successfully', 'initialize');
      return true;
    } catch (error) {
      logger.error(`Typewriter initialization error: ${error.message}`, 'initialize', error);
      return false;
    }
  }
}

/**
 * TabViewModel - Manages tab logic
 */
class TabViewModel {
  constructor(model) {
    this.model = model;
  }

  initialize() {
    const tabSets = this.model.initialize();
    
    tabSets.forEach(tabSet => {
      this.setupTabs(tabSet);
    });
  }

  setupTabs(tabSet) {
    const labels = tabSet.querySelectorAll('.tabbed-labels > label');
    const contents = tabSet.querySelectorAll('.tabbed-content > .tabbed-block');

    // Apply visual styles to active tab
    const updateActiveTab = () => {
      const activeLabel = tabSet.querySelector('input:checked + label');
      if (activeLabel) {
        labels.forEach(label => label.classList.remove('tabbed-labels__active'));
        activeLabel.classList.add('tabbed-labels__active');
      }
    };

    // Add animation when tabs change
    tabSet.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        updateActiveTab();
        
        try {
          // Get the index directly from the radio input's position
          let index = 0;
          const radios = Array.from(tabSet.querySelectorAll('input[type="radio"]'));
          index = radios.indexOf(radio) + 1; // 1-based index for nth-of-type
          
          const activeContent = tabSet.querySelector(`.tabbed-content > .tabbed-block:nth-of-type(${index})`);
          if (activeContent) {
            contents.forEach(content => {
              content.classList.remove('tabbed-content--active');
              content.style.display = 'none';
            });
            activeContent.style.display = 'block';
            setTimeout(() => {
              activeContent.classList.add('tabbed-content--active');
            }, 50);
          }
        } catch (err) {
          logger.error(`Tab switching error: ${err.message}`, 'setupTabs', err);
        }
      });
    });

    // Set active tab initially
    updateActiveTab();
  }
}

/**
 * AnimationViewModel - Manages animation logic
 */
class AnimationViewModel {
  constructor(model) {
    this.model = model;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
  }

  initialize() {
    const sections = this.model.initialize();
    
    sections.forEach(section => {
      section.classList.add('fade-in-section');
      this.observer.observe(section);
    });
  }
}

// ================ APP INITIALIZATION ================

/**
 * AppController - Main application controller
 */
class AppController {
  constructor() {
    // Initialize models
    this.typewriterModel = new TypewriterModel([
      'Product-Minded Software Engineer', 
      'DevOps Transformation Specialist', 
      'Legacy Code Modernizer', 
      'Technical Mentor'
    ]);
    
    this.tabModel = new TabModel();
    this.animationModel = new AnimationModel();

    // Initialize viewModels
    this.typewriterViewModel = new TypewriterViewModel(this.typewriterModel);
    this.tabViewModel = new TabViewModel(this.tabModel);
    this.animationViewModel = new AnimationViewModel(this.animationModel);
  }

  initialize() {
    logger.info('Initializing typewriter controller', 'initialize');

    // Initialize typewriter
    const typewriterElement = document.querySelector('.typewriter-text');
    if (typewriterElement) {
      const success = this.typewriterViewModel.initialize(typewriterElement);
      if (success) {
        logger.info('Typewriter effect initialized successfully', 'initialize');
      } else {
        logger.warn('Typewriter effect initialization failed', 'initialize');
      }
    } else {
      logger.debug('No typewriter element found on page', 'initialize');
    }

    // Initialize tabs
    this.tabViewModel.initialize();
    logger.debug('Tab functionality initialized', 'initialize');

    // Initialize animations
    this.animationViewModel.initialize();
    logger.debug('Animations initialized', 'initialize');
    
    logger.info('Typewriter controller initialization complete', 'initialize');
  }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  logger.debug('DOM loaded, initializing typewriter application', 'DOMContentLoaded');
  
  // Check if the typewriter element exists
  const typewriterElement = document.querySelector('.typewriter-text');
  if (typewriterElement) {
    logger.info(`Typewriter element found: "${typewriterElement.outerHTML.slice(0, 100)}..."`, 'DOMContentLoaded');
  } else {
    logger.warn('No typewriter element found on page with class .typewriter-text', 'DOMContentLoaded');
  }
  
  // Log all scripts on the page to debug library loading issues
  const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline script');
  logger.debug(`Loaded scripts: ${scripts.join(', ')}`, 'DOMContentLoaded');
  
  // Check if the Typewriter library is properly loaded
  if (window.Typewriter) {
    logger.info('Typewriter library detected in global scope', 'DOMContentLoaded');
  } else {
    logger.error('Typewriter library not found in global scope!', 'DOMContentLoaded');
    console.warn('Typewriter library missing. Please check that the CDN is properly loaded.');
    
    // Try loading the library directly if not present
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/typewriter-effect@2.19.0/dist/typewriter.min.js';
    script.onload = () => {
      logger.info('Typewriter library loaded dynamically', 'scriptLoader');
      const app = new AppController();
      app.initialize();
    };
    script.onerror = () => {
      logger.error('Failed to load Typewriter library dynamically', 'scriptLoader');
    };
    document.head.appendChild(script);
    return;
  }
  
  const app = new AppController();
  app.initialize();
  
  // Add a window load event to check if typewriter is still not initialized
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Check if typewriter has been initialized by checking if it has children
      const typewriterEl = document.querySelector('.typewriter-text');
      if (typewriterEl && typewriterEl.children.length === 0 && typewriterEl.innerText === '') {
        logger.warn('Typewriter still appears uninitialized after page load', 'windowLoad');
        console.warn('Typewriter effect failed to initialize. Attempting recovery...');
        
        // Force reload the typewriter script and reinitialize
        const recoveryScript = document.createElement('script');
        recoveryScript.innerHTML = `
          if (window.Typewriter) {
            const element = document.querySelector('.typewriter-text');
            if (element) {
              const strings = element.getAttribute('data-strings') ? 
                element.getAttribute('data-strings').split('|') : 
                ['Product-Minded Software Engineer', 'DevOps Transformation Specialist', 'Legacy Code Modernizer', 'Technical Mentor'];
              
              new Typewriter(element, {
                strings: strings,
                autoStart: true,
                loop: true,
                delay: 75,
                deleteSpeed: 30
              });
              console.log('Typewriter recovery executed');
            }
          }
        `;
        document.head.appendChild(recoveryScript);
      }
    }, 1000); // Check after 1 second to give typewriter time to initialize
  });
});
