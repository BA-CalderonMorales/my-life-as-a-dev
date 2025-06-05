"use strict";
/**
 * Enhanced section transitions with scroll effects
 * Manages section-based scrolling animations and reveals
 */
import { defaultLogger } from './logger.js';

// Set up logger
const logger = defaultLogger.setModule('sectionTransitions');

class SectionTransitions {
  constructor() {
    this.sections = [];
    this.activeSection = null;
    this.initialized = false;
    this.observers = {
      section: null,
      element: null
    };
    this.options = {
      sectionThreshold: 0.15,  // How much of section needs to be visible
      elementThreshold: 0.1,   // How much of element needs to be visible
      animationDelay: 100,     // Base delay for staggered animations
      animationDelayIncrement: 100, // Increment for stagger
      reducedMotion: false     // Honor reduced motion preference
    };
    
    // Check for reduced motion preference
    this.options.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Bind methods
    this.handleSectionIntersect = this.handleSectionIntersect.bind(this);
    this.handleElementIntersect = this.handleElementIntersect.bind(this);
    this.onSectionEnter = this.onSectionEnter.bind(this);
    this.onSectionLeave = this.onSectionLeave.bind(this);
    
    logger.debug('SectionTransitions initialized');
  }

  /**
   * Initialize the section transitions
   */
  init() {
    if (this.initialized) return;
    
    // Find all sections
    this.detectSections();
    
    // Create observers
    this.createObservers();
    
    // Handle scrolled sections that may already be in view
    this.checkInitialSectionVisibility();
    
    // Watch for DOM changes
    this.setupMutationObserver();
    
    this.initialized = true;
  }

  /**
   * Detect all section elements in the page
   */
  detectSections() {
    // Find all section elements
    const sectionElements = Array.from(document.querySelectorAll('section, [data-section]'));
    
    // Store section data
    this.sections = sectionElements.map(element => {
      return {
        element,
        id: element.id || this.generateSectionId(element),
        inView: false,
        entered: false,
        animatedElements: this.getAnimatableElements(element)
      };
    });
    
    logger.debug(`Detected ${this.sections.length} sections`);
  }
  
  /**
   * Find elements inside a section that should be animated
   */
  getAnimatableElements(section) {
    // Elements that should be animated when section enters viewport
    return Array.from(section.querySelectorAll(
      '.animate-on-scroll, .fade-in, .fade-up, .fade-down, ' +
      '.slide-in, .slide-up, .slide-down, .slide-left, .slide-right, ' +
      'h1, h2, h3, p, .btn, .button, .cta-button, img, .card'
    ));
  }
  
  /**
   * Create a unique ID for sections without IDs
   */
  generateSectionId(element) {
    // Create a unique identifier based on position in DOM and classes
    const index = Array.from(document.querySelectorAll('section, [data-section]')).indexOf(element);
    const classNames = element.className.split(' ').filter(Boolean).join('-');
    return `section-${classNames || 'unnamed'}-${index}`;
  }

  /**
   * Create Intersection Observers for sections and elements
   */
  createObservers() {
    // Create observer for sections
    this.observers.section = new IntersectionObserver(this.handleSectionIntersect, {
      threshold: this.options.sectionThreshold,
      rootMargin: '0px'
    });
    
    // Create observer for individual elements
    this.observers.element = new IntersectionObserver(this.handleElementIntersect, {
      threshold: this.options.elementThreshold,
      rootMargin: '0px 0px -10% 0px' // Start animation a bit before element enters viewport
    });
    
    // Observe all sections
    this.sections.forEach(section => {
      this.observers.section.observe(section.element);
    });
  }

  /**
   * Handle sections entering/leaving the viewport
   */
  handleSectionIntersect(entries) {
    entries.forEach(entry => {
      const sectionEl = entry.target;
      const section = this.getSectionByElement(sectionEl);
      
      if (!section) return;
      
      // Update section visibility
      section.inView = entry.isIntersecting;
      
      // Handle section enter/exit
      if (entry.isIntersecting && !section.entered) {
        this.onSectionEnter(section);
        section.entered = true;
      } else if (!entry.isIntersecting && section.entered) {
        this.onSectionLeave(section);
        section.entered = false;
      }
    });
  }

  /**
   * Handle individual elements entering/leaving viewport
   */
  handleElementIntersect(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      
      const element = entry.target;
      
      // Get animation class
      let animationClass = 'fade-in';
      if (element.classList.contains('fade-up')) animationClass = 'fade-up';
      else if (element.classList.contains('fade-down')) animationClass = 'fade-down';
      else if (element.classList.contains('slide-up')) animationClass = 'slide-up';
      else if (element.classList.contains('slide-down')) animationClass = 'slide-down';
      else if (element.classList.contains('slide-left')) animationClass = 'slide-left';
      else if (element.classList.contains('slide-right')) animationClass = 'slide-right';
      
      // Add visible class to animate it
      element.classList.add('visible');
      
      // Stop observing once animated
      this.observers.element.unobserve(element);
    });
  }

  /**
   * When a section enters the viewport
   */
  onSectionEnter(section) {
    // Store as active section
    this.activeSection = section;
    
    // Add class to section
    section.element.classList.add('in-view');
    
    // Start observing elements within this section
    this.startWatchingElements(section);
    
    logger.debug(`Section entered: ${section.id}`);
  }

  /**
   * When a section leaves the viewport
   */
  onSectionLeave(section) {
    // Update active section
    if (this.activeSection === section) {
      this.activeSection = null;
    }
    
    // Remove class from section
    section.element.classList.remove('in-view');
    
    logger.debug(`Section left: ${section.id}`);
  }

  /**
   * Start observing elements within a section
   */
  startWatchingElements(section) {
    // For each animatable element, add to observer 
    section.animatedElements.forEach((element, index) => {
      // Set a delay for staggered animation
      const delay = this.options.reducedMotion ? 0 : 
                    this.options.animationDelay + (index * this.options.animationDelayIncrement);
      
      // Set delay as inline style
      element.style.transitionDelay = `${delay}ms`;
      
      // Add classes to prepare for animation
      element.classList.add('animate-on-scroll');
      
      // Start observing
      this.observers.element.observe(element);
    });
  }

  /**
   * Check if sections are already in view on init
   */
  checkInitialSectionVisibility() {
    // For sections already in viewport on page load
    this.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        this.onSectionEnter(section);
        section.entered = true;
        section.inView = true;
      }
    });
  }

  /**
   * Watch for DOM changes
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      let needsUpdate = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          needsUpdate = true;
          break;
        }
      }
      
      if (needsUpdate) {
        setTimeout(() => this.detectSections(), 300);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Find section object by DOM element
   */
  getSectionByElement(element) {
    return this.sections.find(s => s.element === element);
  }
}

// Export singleton instance
const sectionTransitions = new SectionTransitions();
export default sectionTransitions;
