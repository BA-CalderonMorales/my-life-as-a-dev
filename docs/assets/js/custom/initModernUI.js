/**
 * Initialize modern UI features for the landing page
 * - 3D Background with THREE.js
 * - Smooth scrolling
 * - Intersection Observer animations
 * - Mobile optimizations
 */
import { defaultLogger } from './logger.js';
import ThreeBackground from './threeBackground.js';
import backgroundFallback from './threeBackgroundFallback.js';
import smoothScroll from './smoothScroll.js';

// Set up logger
const logger = defaultLogger.setModule('modernUI');

/**
 * Initialize modern UI features
 */
class ModernUI {
  constructor() {
    // Feature detection flags
    this.hasIntersectionObserver = 'IntersectionObserver' in window;
    this.isLandingPage = document.body.classList.contains('landing-page') || 
                        document.documentElement.classList.contains('landing-page');
    this.isMobile = this.detectMobileDevice();
    
    // References to components
    this.threeBackground = null;
    this.intersectionObserver = null;
    
    // Element cache
    this.sections = [];
    this.animatedElements = [];
    
    // Check if we're actually on a landing page
    if (!this.isLandingPage) {
      // Check for home-page class as fallback
      this.isLandingPage = !!document.querySelector('.home-page-wrapper') || 
                           !!document.querySelector('.home-page');
    }
    
    if (this.isLandingPage) {
      logger.info('Landing page detected, initializing modern UI features');
      this.initModernUI();
    } else {
      logger.debug('Not a landing page, skipping modern UI initialization');
    }
  }
  
  /**
   * Detect mobile device/small screen
   */
  detectMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
      window.innerWidth <= 768;
  }
  
  /**
   * Initialize all modern UI features
   */
  initModernUI() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  /**
   * Main initialization method
   */
  init() {
    // Initialize in sequence for better performance
    setTimeout(() => this.initProgressBar(), 0);
    setTimeout(() => this.initRevealAnimations(), 200);
    setTimeout(() => this.initThreeBackground(), 500);
    setTimeout(() => this.initScrollIndicator(), 800);
    
    // Update copyright year
    this.updateCopyrightYear();
    
    // Set up scroll to top button
    this.setupScrollToTop();
    
    logger.info('Modern UI features initialized');
  }
  
  /**
   * Initialize scroll progress bar
   */
  initProgressBar() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    // Update progress bar on scroll
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollTop / scrollHeight * 100;
      progressBar.style.width = `${progress}%`;
    });
    
    logger.debug('Progress bar initialized');
  }
  
  /**
   * Initialize section reveal animations with Intersection Observer
   */
  initRevealAnimations() {
    if (!this.hasIntersectionObserver) return;
    
    // Get elements to observe for scroll effects
    this.animatedElements = document.querySelectorAll(
      '.section-divider, ' + 
      '.tabbed-experience, ' + 
      '.featured-section, ' + 
      '.final-cta, ' + 
      '.section-title, ' + 
      '.section-subtitle, ' + 
      '.tagline, ' +
      '.feature-card'
    );
    
    // Set up intersection observer
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            
            // Optional: stop observing after reveal
            // this.intersectionObserver.unobserve(entry.target);
          } else {
            // Optional: remove class when out of view
            // entry.target.classList.remove('revealed');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      }
    );
    
    // Add reveal class to elements and begin observing
    this.animatedElements.forEach(el => {
      el.classList.add('reveal-element');
      this.intersectionObserver.observe(el);
    });
    
    logger.debug(`Initialized reveal animations for ${this.animatedElements.length} elements`);
  }
  
  /**
   * Initialize THREE.js background
   */
  initThreeBackground() {
    try {
      // Check URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('background') && urlParams.get('background') === 'false') {
        logger.debug('Background disabled via URL parameter');
        return;
      }
      
      // Don't initialize on mobile by default to save resources
      if (this.isMobile) {
        // Check if explicitly enabled on mobile
        if (!(urlParams.has('background') && urlParams.get('background') === 'true')) {
          logger.debug('Background disabled on mobile for performance');
          // Use fallback on mobile instead
          backgroundFallback.init();
          backgroundFallback.start();
          return;
        }
      }
      
      // Initialize Three.js background
      this.threeBackground = new ThreeBackground({
        // Use fewer particles on mobile
        particleCount: this.isMobile ? 60 : 150,
        particleSize: this.isMobile ? 0.1 : 0.15
      });
      this.threeBackground.start();
      
      // Add pause/resume on visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.threeBackground) {
          this.threeBackground.stop();
        } else if (this.threeBackground) {
          this.threeBackground.start();
        }
      });
      
      logger.info('THREE.js background initialized');
    } catch (error) {
      logger.error(`Failed to initialize THREE.js background: ${error.message}`);
      
      // Use fallback if THREE.js fails
      try {
        backgroundFallback.init();
        backgroundFallback.start();
        logger.info('Using fallback background due to THREE.js failure');
      } catch (fallbackError) {
        logger.error(`Fallback background also failed: ${fallbackError.message}`);
      }
    }
  }
  
  /**
   * Initialize scroll indicator animation
   */
  initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    // Add click event listener
    scrollIndicator.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = scrollIndicator.getAttribute('data-target');
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          smoothScroll.scrollToElement(targetElement);
        }
      }
    });
    
    // Fade out scroll indicator when scrolling down
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 100) {
        scrollIndicator.classList.add('faded');
      } else {
        scrollIndicator.classList.remove('faded');
      }
    });
    
    logger.debug('Scroll indicator initialized');
  }
  
  /**
   * Update copyright year
   */
  updateCopyrightYear() {
    const copyrightElement = document.querySelector('.copyright-year');
    if (copyrightElement) {
      copyrightElement.textContent = new Date().getFullYear().toString();
      logger.debug('Copyright year updated');
    }
  }
  
  /**
   * Set up scroll to top button
   */
  setupScrollToTop() {
    // Create scroll to top button if it doesn't exist
    if (!document.querySelector('.scroll-to-top')) {
      const scrollToTopButton = document.createElement('button');
      scrollToTopButton.className = 'scroll-to-top';
      scrollToTopButton.setAttribute('aria-label', 'Scroll to top');
      scrollToTopButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
        </svg>
      `;
      document.body.appendChild(scrollToTopButton);
      
      // Add click event listener
      scrollToTopButton.addEventListener('click', () => {
        smoothScroll.scrollTo(0);
      });
      
      // Show/hide based on scroll position
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
          scrollToTopButton.classList.add('visible');
        } else {
          scrollToTopButton.classList.remove('visible');
        }
      });
      
      logger.debug('Scroll to top button initialized');
    }
  }
}

// Initialize on load
const modernUI = new ModernUI();

// Export for potential reuse
export default modernUI;
