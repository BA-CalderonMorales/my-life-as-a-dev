import { Logger } from './logger.js';  // Use named import instead of default import
import InteractivityUtils from './interactivity-utils.js';

const logger = new Logger('scrollEffects');

/**
 * ScrollEffects
 * Core utility for handling scroll-based animations and effects
 */
class ScrollEffects {
  constructor(options = {}) {
    this.options = {
      parallaxSelector: '.parallax',
      fadeInSelector: '.fade-in',
      slideInSelector: '.slide-in',
      ...options
    };

    this.initialized = false;
    this.observers = [];
    
    // Skip animations for users who prefer reduced motion
    this.reducedMotion = InteractivityUtils.prefersReducedMotion();
    if (this.reducedMotion) {
      logger.info('Reduced motion preference detected, minimizing animations');
    }
    
    logger.debug('Initializing scroll effects');
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    logger.debug('Setting up scroll effects');
    
    // Setup parallax elements
    this.setupParallax();
    
    // Setup fade in elements
    this.setupFadeIn();
    
    // Setup slide in elements
    this.setupSlideIn();
    
    this.initialized = true;
  }

  setupParallax() {
    const elements = document.querySelectorAll(this.options.parallaxSelector);
    if (elements.length === 0) return;
    
    logger.debug(`Found ${elements.length} parallax elements`);
    
    if (this.reducedMotion) {
      // Make elements visible without parallax effect
      elements.forEach(el => el.style.transform = 'none');
      return;
    }

    const handleScroll = InteractivityUtils.throttle(() => {
      const scrollY = window.pageYOffset;
      elements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        const yPos = -(scrollY * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    }, 10);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize positions
  }

  setupFadeIn() {
    if (this.reducedMotion) {
      // Make elements visible without animation
      document.querySelectorAll(this.options.fadeInSelector).forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      return;
    }
    
    const observer = InteractivityUtils.addSmoothReveal(this.options.fadeInSelector, {
      threshold: 0.2,
      once: true
    });
    
    this.observers.push(observer);
  }

  setupSlideIn() {
    if (this.reducedMotion) {
      // Make elements visible without animation
      document.querySelectorAll(this.options.slideInSelector).forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      return;
    }
    
    const observer = InteractivityUtils.addSmoothReveal(this.options.slideInSelector, {
      threshold: 0.1,
      once: true
    });
    
    this.observers.push(observer);
  }

  destroy() {
    // Clean up observers
    this.observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    this.observers = [];
    this.initialized = false;
  }
}

// Export as default
export default ScrollEffects;