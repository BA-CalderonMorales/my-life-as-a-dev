/**
 * LandingPage ViewModels
 * 
 * This file contains the ViewModel classes for the landing page MVVM implementation.
 * ViewModels connect the Models to the Views and handle the business logic.
 */

import { defaultLogger } from '../logger/index.js';

// Create a module-specific logger instance
const logger = defaultLogger.setModule('landingPage');

/**
 * ScrollViewModel - Handles scroll-related logic
 * 
 * Note: This class coordinates with scrollEffects.js but has a narrower focus
 * on scroll indicators and other landing-page specific functionality.
 */
export class ScrollViewModel {
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
  
  // This is now handled by scrollEffects module
  setupScrollProgressTracking(scrollProgressElement) {
    logger.debug('Scroll progress tracking delegated to scrollEffects.js', 'setupScrollProgressTracking');
  }
}

/**
 * AnimationViewModel - Handles animation-related logic
 */
export class AnimationViewModel {
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
export class ContentViewModel {
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
