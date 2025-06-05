"use strict";
/**
 * Initialize modern UI features for the landing page
 * - 3D Background with THREE.js
 * - Smooth scrolling
 * - Intersection Observer animations
 * - Section transitions and reveals
 * - Performance monitoring and optimizations
 * - Mobile optimizations
 */
import { defaultLogger } from './logger.js';
import ThreeBackground from './threeBackground.js';
import backgroundFallback from './threeBackgroundFallback.js';
import smoothScroll from './smoothScroll.js';
import performanceMonitor from './performanceMonitor.js';
import sectionTransitions from './sectionTransitions.js';

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
          backgroundFallback.init();
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
      
      // Check device capabilities with performance monitor
      const shouldUseThreeJs = !performanceMonitor.deviceInfo.isLowEndDevice || 
                               (urlParams.has('background') && urlParams.get('background') === 'true');
      
      // Don't initialize on mobile/low-end devices by default to save resources
      if (!shouldUseThreeJs) {
        logger.debug('THREE.js background disabled for performance reasons');
        // Use fallback on mobile/low-end devices instead
        backgroundFallback.init();
        backgroundFallback.start();
        return;
      }
      
      // Initialize Three.js background with optimized settings
      const isMobile = performanceMonitor.deviceInfo.isMobile;
      const isLowEnd = performanceMonitor.deviceInfo.isLowEndDevice;
      
      this.threeBackground = new ThreeBackground({
        // Optimize particle count based on device capabilities
        particleCount: isMobile ? (isLowEnd ? 40 : 60) : 150,
        particleSize: isMobile ? 0.1 : 0.15,
        maxConnections: isMobile ? (isLowEnd ? 2 : 3) : 5,
        density: isMobile ? 0.5 : 0.8,
        // Allow custom optimization based on URL params
        ...this.getCustomThreeParams()
      });
      
      // Set up THREE.js performance adaptation
      if (this.threeBackground.setPerformanceMonitor) {
        this.threeBackground.setPerformanceMonitor(performanceMonitor);
      }
      
      this.threeBackground.start();
      
      // Add pause/resume on visibility change to save resources
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.threeBackground) {
          this.threeBackground.stop();
        } else if (this.threeBackground) {
          this.threeBackground.start();
        }
      });
      
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
      // Adjust these thresholds based on content layout
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

// Initialize on load
const modernUI = new ModernUI();

// Export for potential reuse
export default modernUI;
