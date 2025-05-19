/**
 * Modern UI Module
 * - 3D Background with THREE.js
 * - Smooth scrolling
 * - Intersection Observer animations
 * - Section transitions and reveals
 * - Performance monitoring and optimizations
 * - Mobile optimizations
 */
import { defaultLogger } from '../logger/index.js';
import smoothScroll from '../smoothScroll/index.js';
import performanceMonitor from '../performanceMonitor/index.js';
import sectionTransitions from '../sectionTransitions/index.js';

// Set up logger
const logger = defaultLogger.setModule('modernUI');

// Feature detection
const features = {
  supportsWebGL: (function() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e) {
      return false;
    }
  })()
};

/**
 * Modern UI class
 * Manages all modern UI features for the site
 */
class ModernUI {
  constructor() {
    // Feature detection flags
    this.hasIntersectionObserver = 'IntersectionObserver' in window;
    this.isLandingPage = document.body.classList.contains('landing-page') || 
                        document.documentElement.classList.contains('landing-page');
    this.isMobile = this.detectMobileDevice();
    this.supportsWebGL = this.detectWebGLSupport();
    
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
    // Initialize performance monitoring first
    setTimeout(() => this.initPerformanceMonitor(), 0);
    
    // Initialize in sequence for better performance
    setTimeout(() => this.initProgressBar(), 100);
    setTimeout(() => this.initRevealAnimations(), 200);
    setTimeout(() => this.initSectionTransitions(), 300);
    setTimeout(() => this.initThreeBackground(), 500);
    setTimeout(() => this.initScrollIndicator(), 800);
    
    // Update copyright year
    this.updateCopyrightYear();
    
    // Set up scroll to top button
    this.setupScrollToTop();
    
    logger.info('Modern UI features initialized');
  }
  
  /**
   * Initialize performance monitoring
   */
  initPerformanceMonitor() {
    performanceMonitor.setCallbacks({
      onLowPerformance: () => {
        // Reduce visual complexity when performance is low
        if (this.threeBackground) {
          // Reduce particle count and complexity
          this.threeBackground.setLowPerformanceMode(true);
        }
        
        // Add class to body to allow CSS performance optimizations
        document.body.classList.add('low-performance-mode');
      },
      onVeryLowPerformance: () => {
        // Drastically reduce visual effects or switch to fallback
        if (this.threeBackground && this.threeBackground.isActive) {
          // Either disable or switch to fallback
          this.threeBackground.stop();
          this.initBackgroundFallback();
        }
        
        // Add class for very low performance CSS adjustments
        document.body.classList.add('very-low-performance-mode');
      },
      onGoodPerformance: () => {
        // Restore full visual complexity
        if (this.threeBackground) {
          this.threeBackground.setLowPerformanceMode(false);
        }
        
        // Remove performance limitation classes
        document.body.classList.remove('low-performance-mode');
        document.body.classList.remove('very-low-performance-mode');
      }
    });
    
    // Start monitoring
    performanceMonitor.startMonitoring();
  }
  
  /**
   * Initialize section transitions
   */
  initSectionTransitions() {
    sectionTransitions.init();
    logger.debug('Section transitions initialized');
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
      
      // Check if THREE.js background should be initialized
      if (!this.isLandingPage || !this.supportsWebGL) {
        logger.info('Skipping THREE.js background - not on landing page or WebGL not supported');
        this.initBackgroundFallback();
        return;
      }
      
      // Dynamically import Three.js background to prevent loading errors
      import('../threeBackground/index.js')
        .then(module => {
          const ThreeBackground = module.default;
          this.threeBackground = new ThreeBackground({
            density: this.isMobile ? 0.5 : 0.8,
            interactive: true,
            particleCount: this.isMobile ? 80 : 150
          });
          if (this.threeBackground.start) {
            this.threeBackground.start();
          }
          
          // Add resize handler with throttling for performance
          let resizeTimeout;
          window.addEventListener('resize', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
              if (this.threeBackground && this.threeBackground.handleResize) {
                this.threeBackground.handleResize();
              }
            }, 200);
          });
          
          logger.info('THREE.js background initialized with performance optimization');
        })
        .catch(error => {
          logger.error('Failed to load THREE.js background, using fallback', error);
          this.initBackgroundFallback();
        });
    } catch (error) {
      logger.error('Error initializing THREE.js background', error);
      this.initBackgroundFallback();
    }
  }
  /**
   * Initialize background fallback (simpler background when THREE.js is unavailable)
   */
  initBackgroundFallback() {
    try {
      // First try to load the fallback module
      import('../threeBackgroundFallback/index.js')
        .then(module => {
          const BackgroundFallback = module.default;
          BackgroundFallback.init();
          BackgroundFallback.start();
          logger.info('Background fallback initialized');
        })
        .catch(error => {
          // If module fails, create a simple CSS gradient
          logger.error('Failed to load background fallback module', error);
          this.createCssGradientBackground();
        });
    } catch (error) {
      // Create a simple CSS gradient background as ultimate fallback
      logger.error('Error initializing background fallback', error);
      this.createCssGradientBackground();
    }
  }
  
  /**
   * Create a CSS gradient background as fallback
   */
  createCssGradientBackground() {
    const bgElement = document.createElement('div');
    bgElement.className = 'fallback-background';
    bgElement.style.position = 'fixed';
    bgElement.style.top = '0';
    bgElement.style.left = '0';
    bgElement.style.width = '100%';
    bgElement.style.height = '100%';
    bgElement.style.zIndex = '-1';
    bgElement.style.background = 'linear-gradient(135deg, #12242e 0%, #233a4a 100%)';
    document.body.prepend(bgElement);
    logger.info('CSS gradient background created as fallback');
  }
      
  /**
   * Get custom THREE.js parameters from URL
   */
  getCustomThreeParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for custom THREE.js parameters
    if (urlParams.has('particleCount')) {
      params.particleCount = parseInt(urlParams.get('particleCount'), 10);
    }
    if (urlParams.has('particleSize')) {
      params.particleSize = parseFloat(urlParams.get('particleSize'));
    }
    if (urlParams.has('maxConnections')) {
      params.maxConnections = parseInt(urlParams.get('maxConnections'), 10);
    }
    
    return params;
  }
  
  /**
   * Initialize scroll indicator animation and section behaviors
   */
  initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const ctaSection = document.querySelector('.cta-section');
    const heroSection = document.querySelector('.hero-section');
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
    
    // Calculate hero section dimensions
    let heroHeight = 0;
    if (heroSection) {
      heroHeight = heroSection.offsetHeight;
    }
    
    // Create enhanced scroll handling
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      
      // Define thresholds for different scroll effects
      const scrollIndicatorThreshold = viewportHeight * 0.4;  // 40% of viewport height
      const ctaSectionThreshold = heroHeight * 0.7;          // 70% of hero section height
      
      // Calculate progress through hero section
      const heroProgress = Math.min(scrollY / heroHeight, 1);
      
      // Handle scroll indicator fade - delay the fade out
      if (scrollY > scrollIndicatorThreshold) {
        scrollIndicator.classList.add('faded');
      } else {
        scrollIndicator.classList.remove('faded');
      }
      
      // Handle CTA section transition - only start transitioning after significant scroll
      if (ctaSection) {
        if (scrollY > ctaSectionThreshold) {
          ctaSection.classList.add('scrolled');
          // Calculate opacity based on scroll position for smoother transition
          const opacity = Math.max(0.5, 1 - (heroProgress - 0.7) * 2);
          ctaSection.style.opacity = opacity;
        } else {
          ctaSection.classList.remove('scrolled');
          ctaSection.style.opacity = 1;
        }
      }
    });
    
    logger.debug('Scroll indicator initialized with enhanced behaviors');
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

// Export the class
export default ModernUI;
