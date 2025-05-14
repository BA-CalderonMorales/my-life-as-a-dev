
/**
 * LandingPage.js - MVVM Implementation
 * 
 * This file implements landing page functionality using the MVVM pattern:
 * - Model: Data structures for page elements and state
 * - View: DOM elements managed through ViewModel interaction
 * - ViewModel: Business logic connecting models to views
 * 
 * This works in coordination with scrollEffects.js which handles parallax and scroll
 * animations while this focuses on content and UI-specific features.
 */

import { defaultLogger } from './logger.js';
// We import the scroll effects module but handle the case where it might load after this file
let scrollEffectsModule = null;
try {
  // Dynamic import to avoid circular dependencies
  import('./scrollEffects.js').then(module => {
    scrollEffectsModule = module;
  }).catch(err => {
    console.error('Error importing scrollEffects.js:', err);
  });
} catch (error) {
  console.error('Error setting up scrollEffects import:', error);
}

// Initialize module logger
const logger = defaultLogger.setModule('landingPage');

// ================ MODELS ================

/**
 * ScrollModel - Manages scroll-related data
 */
class ScrollModel {
  constructor() {
    this.scrollIndicators = [];
    this.scrollProgress = null;
  }

  initialize() {
    this.scrollIndicators = Array.from(document.querySelectorAll('.scroll-indicator'));
    this.scrollProgress = document.querySelector('.scroll-progress');
    return {
      scrollIndicators: this.scrollIndicators,
      scrollProgress: this.scrollProgress
    };
  }
}

/**
 * AnimationModel - Manages animation-related data
 */
class AnimationModel {
  constructor() {
    this.sections = [];
    this.labels = [];
  }

  initialize() {
    this.sections = Array.from(document.querySelectorAll('.tabbed-set .tabbed-content section'));
    this.labels = Array.from(document.querySelectorAll('.tabbed-labels > label'));
    return {
      sections: this.sections,
      labels: this.labels
    };
  }
}

/**
 * ContentModel - Manages miscellaneous content elements
 */
class ContentModel {
  constructor() {
    this.copyrightElement = null;
    this.currentYear = new Date().getFullYear();
  }

  initialize() {
    this.copyrightElement = document.querySelector('.copyright-year');
    return {
      copyrightElement: this.copyrightElement,
      currentYear: this.currentYear
    };
  }
}

// ================ VIEWMODELS ================

/**
 * ScrollViewModel - Handles scroll-related logic
 * 
 * Note: This class coordinates with scrollEffects.js but has a narrower focus
 * on scroll indicators and other landing-page specific functionality.
 * The main scroll animations and parallax effects are handled by scrollEffects.js
 */
class ScrollViewModel {
  constructor(model) {
    this.model = model;
  }

  initialize() {
    logger.debug('Initializing landing page scroll functionality', 'initialize');
    const { scrollIndicators, scrollProgress } = this.model.initialize();
    
    // Set up scroll indicators for quick navigation
    if (scrollIndicators.length > 0) {
      this.setupScrollIndicators(scrollIndicators);
      logger.debug(`${scrollIndicators.length} scroll indicators initialized`, 'initialize');
    }
    
    // We don't need to set up progress tracking here as it's handled by scrollEffects.js
    // This just ensures the element exists in the DOM for scrollEffects.js to find
    if (!scrollProgress) {
      logger.warn('Scroll progress element not found in DOM', 'initialize');
    }
    
    // Add landing-page class to the body if it's not already there
    // This helps ensure scrollEffects.js will initialize properly
    if (!document.body.classList.contains('landing-page') && 
        document.querySelector('.home-page')) {
      document.body.classList.add('landing-page');
      logger.debug('Added landing-page class to body element', 'initialize');
    }
  }

  setupScrollIndicators(indicators) {
    indicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = indicator.getAttribute('data-target');
        const targetElement = document.getElementById(targetSection);
        
        if (targetElement) {
          // Scroll with smooth animation
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          logger.debug(`Scrolled to section: ${targetSection}`, 'scrollToSection');
        } else {
          logger.warn(`Target section not found: ${targetSection}`, 'scrollToSection');
        }
      });
    });
  }
  
  // We're leaving this empty as scroll progress is now handled by scrollEffects.js
  // But we keep the method for compatibility with existing code
  setupScrollProgressTracking(scrollProgressElement) {
    logger.debug('Scroll progress tracking delegated to scrollEffects.js', 'setupScrollProgressTracking');
  }
}

/**
 * AnimationViewModel - Handles animation-related logic
 */
class AnimationViewModel {
  constructor(model) {
    this.model = model;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer.unobserve(entry.target);
          logger.debug('Element animation triggered', 'intersectionObserver');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
  }

  initialize() {
    logger.debug('Initializing animations', 'initialize');
    const { sections, labels } = this.model.initialize();
    
    // Setup fade-in animations
    if (sections.length > 0) {
      this.setupSectionAnimations(sections);
      logger.debug(`${sections.length} section animations initialized`, 'initialize');
    }
    
    // Setup tab animations
    if (labels.length > 0) {
      this.setupTabAnimations(labels);
      logger.debug(`${labels.length} tab animations initialized`, 'initialize');
    }
  }

  setupSectionAnimations(sections) {
    sections.forEach(section => {
      section.classList.add('fade-in-section');
      this.observer.observe(section);
    });
  }

  setupTabAnimations(labels) {
    labels.forEach(label => {
      label.addEventListener('click', () => {
        // Small delay to ensure the tab content is visible before animating
        setTimeout(() => {
          const activeTabContent = document.querySelector('.tabbed-content--active');
          if (activeTabContent) {
            activeTabContent.classList.add('tab-animated');
            logger.debug('Tab animation triggered', 'tabClick');
          }
        }, 50);
      });
    });
  }
}

/**
 * ContentViewModel - Handles content-related logic
 */
class ContentViewModel {
  constructor(model) {
    this.model = model;
  }

  initialize() {
    logger.debug('Initializing content elements', 'initialize');
    const { copyrightElement, currentYear } = this.model.initialize();
    
    // Update copyright year
    if (copyrightElement) {
      copyrightElement.textContent = currentYear;
      logger.debug(`Copyright year updated to ${currentYear}`, 'initialize');
    }
  }
}

// ================ APP INITIALIZATION ================

/**
 * LandingPageController - Main controller for the landing page
 */
class LandingPageController {
  constructor() {
    // Initialize models
    this.scrollModel = new ScrollModel();
    this.animationModel = new AnimationModel();
    this.contentModel = new ContentModel();

    // Initialize viewModels
    this.scrollViewModel = new ScrollViewModel(this.scrollModel);
    this.animationViewModel = new AnimationViewModel(this.animationModel);
    this.contentViewModel = new ContentViewModel(this.contentModel);
  }

  initialize() {
    logger.info('Initializing landing page controller', 'initialize');

    // Check if we're on the home page/landing page
    const isHomePage = document.querySelector('.md-content__inner.home-page') || 
                      document.querySelector('.home-page');
    
    if (!isHomePage) {
      logger.info('Not on home page, skipping initialization', 'initialize');
      return;
    }
    
    // Mark this as a landing page for other scripts (like scrollEffects.js)
    if (!document.documentElement.classList.contains('landing-page')) {
      document.documentElement.classList.add('landing-page');
    }

    // Initialize components
    this.scrollViewModel.initialize();
    this.animationViewModel.initialize();
    this.contentViewModel.initialize();

    // If we're on the landing page, ensure scroll effects are triggered
    try {
      // Add a small delay to ensure DOM elements are fully rendered
      setTimeout(() => {
        // Force scroll event to update progress bar and parallax
        window.dispatchEvent(new Event('scroll'));
        logger.debug('Dispatched initial scroll event', 'initialize');
      }, 200);
    } catch (error) {
      logger.error(`Error dispatching initial scroll event: ${error.message}`, 'initialize');
    }

    logger.info('Landing page controller initialized', 'initialize');
  }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const app = new LandingPageController();
  app.initialize();
});
