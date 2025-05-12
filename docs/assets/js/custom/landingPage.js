
/**
 * LandingPage.js - MVVM Implementation
 * 
 * This file implements landing page functionality using the MVVM pattern:
 * - Model: Data structures for page elements and state
 * - View: DOM elements managed through ViewModel interaction
 * - ViewModel: Business logic connecting models to views
 */

import { defaultLogger } from './logger.js';

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
 */
class ScrollViewModel {
  constructor(model) {
    this.model = model;
  }

  initialize() {
    logger.debug('Initializing scroll functionality', 'initialize');
    const { scrollIndicators, scrollProgress } = this.model.initialize();
    
    // Set up scroll indicators
    if (scrollIndicators.length > 0) {
      this.setupScrollIndicators(scrollIndicators);
      logger.debug(`${scrollIndicators.length} scroll indicators initialized`, 'initialize');
    }
    
    // Set up scroll progress tracking
    if (scrollProgress) {
      this.setupScrollProgressTracking(scrollProgress);
      logger.debug('Scroll progress tracking initialized', 'initialize');
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

  setupScrollProgressTracking(scrollProgressElement) {
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      
      scrollProgressElement.style.width = scrollPercent + '%';
    });
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

    // Only run on home page
    if (!document.querySelector('.md-content__inner.home-page')) {
      logger.info('Not on home page, skipping initialization', 'initialize');
      return;
    }

    // Initialize components
    this.scrollViewModel.initialize();
    this.animationViewModel.initialize();
    this.contentViewModel.initialize();

    logger.info('Landing page controller initialized', 'initialize');
  }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const app = new LandingPageController();
  app.initialize();
});
