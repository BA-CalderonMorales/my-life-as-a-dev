"use strict";

/**
 * ScrollEffects.js - MVVM implementation of scroll-based animations and effects
 * 
 * Architecture:
 * - Model: Manages data and state related to scrolling and animations
 * - View: Updates the DOM based on model state
 * - ViewModel: Connects the Model and View, handles business logic
 */

import { defaultLogger } from './logger.js';

// Create a module-specific logger instance
const logger = defaultLogger.setModule('scrollEffects');

/**
 * Model - Manages scroll-related data and state
 */
class ScrollModel {
  constructor() {
    // Check both body and document classes for landing-page
    this.isLandingPage = document.body.classList.contains('landing-page') || 
                         document.documentElement.classList.contains('landing-page');
    this.scrollPosition = 0;
    this.heroSectionMaxScroll = 600;
    this.headerOffset = 100;
    this.revealThreshold = 0.1;
    this.revealMargin = '0px 0px -50px 0px';
    this.parallaxFactor = 0.3;
    
    // Elements to observe for scroll effects
    this.revealElementSelectors = [
      '.section-divider',
      '.tabbed-experience', 
      '.final-cta', 
      '.featured-section'
    ];
  }
  
  /**
   * Updates the current scroll position
   * @param {number} position - The new scroll position
   */
  updateScrollPosition(position) {
    this.scrollPosition = position;
    logger.debug(`Scroll position updated: ${position}px`, 'updateScrollPosition');
  }
  
  /**
   * Checks if the current page is a landing page
   * @returns {boolean} True if this is a landing page
   */
  isOnLandingPage() {
    if (!this.isLandingPage) {
      // Double check by looking for home-page element as fallback
      this.isLandingPage = !!document.querySelector('.md-content__inner.home-page') ||
                          !!document.querySelector('.home-page');
    }
    return this.isLandingPage;
  }
}

/**
 * View - Handles DOM updates and UI interactions
 */
class ScrollView {
  constructor() {
    // Try to find hero section in different DOM structures
    this.heroSection = document.querySelector('.hero-section');
    // Try to find progress bar in different locations
    this.progressBar = document.querySelector('.scroll-progress');
    this.revealElements = [];
    this.anchors = document.querySelectorAll('a[href^="#"]');
    
    logger.debug('ScrollView initialized with:' + 
      `\nHero section: ${this.heroSection ? 'Found' : 'Not found'}` +
      `\nProgress bar: ${this.progressBar ? 'Found' : 'Not found'}` +
      `\nAnchors: ${this.anchors.length} found`, 'constructor');
  }
  
  /**
   * Initializes reveal elements for observation
   * @param {string[]} selectors - CSS selectors for elements to reveal
   */
  initRevealElements(selectors) {
    const elements = [];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        elements.push(el);
        // Add the reveal-element class if it doesn't already have it
        if (!el.classList.contains('reveal-element')) {
          el.classList.add('reveal-element');
        }
      });
    });
    this.revealElements = elements;
    logger.info(`Initialized ${elements.length} reveal elements`, 'initRevealElements');
    return elements;
  }
  
  /**
   * Updates the hero section based on scroll position
   * @param {number} scrollY - Current Y scroll position
   * @param {number} maxScroll - Maximum scroll threshold
   * @param {number} parallaxFactor - Factor to control parallax intensity
   */
  updateHeroSection(scrollY, maxScroll, parallaxFactor) {
    if (!this.heroSection) return;
    
    if (scrollY <= maxScroll) {
      const translateY = scrollY * parallaxFactor;
      const opacity = 1 - (scrollY / maxScroll);
      
      this.heroSection.style.transform = `translateY(${translateY}px)`;
      this.heroSection.style.opacity = opacity;
      logger.debug(`Hero section updated: translateY(${translateY}px), opacity: ${opacity}`, 'updateHeroSection');
    }
  }
  
  /**
   * Updates the progress bar based on scroll position
   * @param {number} percent - Scroll percentage (0-100)
   */
  updateProgressBar(percent) {
    if (!this.progressBar) {
      // Try to find it again - it might have been added dynamically
      this.progressBar = document.querySelector('.scroll-progress');
      if (!this.progressBar) return;
    }
    
    this.progressBar.style.width = `${percent}%`;
    logger.debug(`Progress bar updated: ${percent}%`, 'updateProgressBar');
  }
  
  /**
   * Scrolls to a specific element
   * @param {HTMLElement} element - The target element to scroll to
   * @param {number} offset - Offset from the top (for headers)
   */
  scrollToElement(element, offset) {
    if (!element) return;
    
    window.scrollTo({
      top: element.offsetTop - offset,
      behavior: 'smooth'
    });
    logger.info(`Scrolling to element: ${element.id || 'unknown'}`, 'scrollToElement');
  }
  
  /**
   * Adds the revealed class to an element
   * @param {HTMLElement} element - The element to reveal
   */
  revealElement(element) {
    if (!element) return;
    
    element.classList.add('revealed');
    logger.debug(`Revealed element: ${element.className}`, 'revealElement');
  }
}

/**
 * ViewModel - Connects the Model and View, handles business logic
 */
class ScrollViewModel {
  /**
   * Creates a new ScrollViewModel
   * @param {ScrollModel} model - The data model
   * @param {ScrollView} view - The view
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.revealObserver = null;
    this.initialized = false;
    
    // We'll try to initialize in the constructor, but we'll also
    // set up a fallback to initialize once the DOM is fully loaded
    if (!this.model.isOnLandingPage()) {
      logger.info('Landing page not detected initially, will check again when fully loaded', 'constructor');
      // Will check again once DOM is fully loaded
    } else {
      logger.info('Landing page detected, initializing scroll effects', 'constructor');
      this.initialize();
    }
  }
  
  /**
   * Check if we're on a landing page and initialize if needed
   * This is a safety method to ensure initialization happens even if DOM 
   * elements aren't available at the time of initial construction
   */
  checkAndInitialize() {
    if (this.initialized) return;
    
    if (this.model.isOnLandingPage()) {
      logger.info('Landing page confirmed on second check, initializing scroll effects', 'checkAndInitialize');
      this.initialize();
    } else {
      logger.info('Not on landing page, scroll effects disabled', 'checkAndInitialize');
    }
  }
  
  /**
   * Initializes all scroll effects
   */
  initialize() {
    if (this.initialized) return;
    
    try {
      this.setupSmoothScrolling();
      this.setupParallaxEffect();
      this.setupScrollReveal();
      this.setupProgressBar();
      
      this.initialized = true;
      logger.info('All scroll effects successfully initialized', 'initialize');
    } catch (error) {
      logger.error(`Error initializing scroll effects: ${error.message}`, 'initialize');
      console.error(error);
    }
  }
  
  /**
   * Sets up smooth scrolling for anchor links
   */
  setupSmoothScrolling() {
    if (this.view.anchors.length === 0) {
      logger.warn('No anchor links found for smooth scrolling', 'setupSmoothScrolling');
      return;
    }
    
    this.view.anchors.forEach(anchor => {
      // Check if this event listener is already added to avoid duplicates
      const alreadyHasListener = anchor.getAttribute('data-scroll-handler');
      if (alreadyHasListener) return;
      
      anchor.setAttribute('data-scroll-handler', 'true');
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href').substring(1);
        
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            this.view.scrollToElement(targetElement, this.model.headerOffset);
            
            // Update URL without page reload
            history.pushState(null, null, `#${targetId}`);
            logger.info(`Smooth scroll to #${targetId}`, 'smoothScrollHandler');
          } else {
            logger.warn(`Target element #${targetId} not found`, 'smoothScrollHandler');
          }
        }
      });
    });
    logger.info(`Smooth scrolling initialized for ${this.view.anchors.length} anchors`, 'setupSmoothScrolling');
  }
  
  /**
   * Sets up parallax effect for the hero section
   */
  setupParallaxEffect() {
    if (!this.view.heroSection) {
      logger.warn('Hero section not found, parallax effect disabled', 'setupParallaxEffect');
      return;
    }
    
    // Ensure we don't add duplicate handlers
    if (!window.hasParallaxHandler) {
      window.hasParallaxHandler = true;
      
      window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        this.model.updateScrollPosition(scrollPosition);
        this.view.updateHeroSection(
          scrollPosition, 
          this.model.heroSectionMaxScroll, 
          this.model.parallaxFactor
        );
      });
      logger.info('Parallax effect initialized', 'setupParallaxEffect');
    } else {
      logger.info('Parallax effect handler already exists, skipping', 'setupParallaxEffect');
    }
  }
  
  /**
   * Sets up reveal animation for elements as they scroll into view
   */
  setupScrollReveal() {
    const elements = this.view.initRevealElements(this.model.revealElementSelectors);
    
    if (elements.length === 0) {
      logger.warn('No reveal elements found, scroll reveal disabled', 'setupScrollReveal');
      return;
    }
    
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.view.revealElement(entry.target);
          this.revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: this.model.revealThreshold,
      rootMargin: this.model.revealMargin
    });
    
    elements.forEach(element => {
      this.revealObserver.observe(element);
    });
    
    logger.info(`Scroll reveal initialized for ${elements.length} elements`, 'setupScrollReveal');
  }
  
  /**
   * Sets up the scroll progress bar
   */
  setupProgressBar() {
    // Ensure we're not duplicating event listeners
    if (window.hasProgressBarHandler) {
      logger.info('Progress bar handler already exists, skipping', 'setupProgressBar');
      return;
    }
    
    // We might not have the progress bar yet, but we'll set up the handler anyway
    window.hasProgressBarHandler = true;
    
    window.addEventListener('scroll', () => {
      // Make sure we have the progress bar element (might be added after script loads)
      if (!this.view.progressBar) {
        this.view.progressBar = document.querySelector('.scroll-progress');
      }
      
      if (this.view.progressBar) {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        this.view.updateProgressBar(scrolled);
      }
    });
    
    if (this.view.progressBar) {
      logger.info('Progress bar initialized', 'setupProgressBar');
    } else {
      logger.warn('Progress bar element not found initially, will try again on scroll', 'setupProgressBar');
    }
  }
}

// Create a global instance that can be accessed by other components
let scrollEffectsViewModel;

// Initialize the MVVM components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const model = new ScrollModel();
  const view = new ScrollView();
  scrollEffectsViewModel = new ScrollViewModel(model, view);
  
  // Add a delayed check to catch elements that might be rendered after initial load
  setTimeout(() => {
    scrollEffectsViewModel.checkAndInitialize();
  }, 500);
});

// Export for potential use by other modules
export { ScrollModel, ScrollView, ScrollViewModel, scrollEffectsViewModel };
