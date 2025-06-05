"use strict";
/**
 * SmoothScroll.js
 * Enhanced smooth scrolling with easing functions for a quality UI experience
 */
import { defaultLogger } from './logger.js';

// Set up logger
const logger = defaultLogger.setModule('smoothScroll');

class SmoothScroll {
  constructor(options = {}) {
    this.options = {
      duration: 800,         // Duration of scroll in ms
      offset: 0,             // Offset from top of target
      easing: 'easeInOutCubic', // Easing function
      callback: null,        // Function to call after scrolling
      mobileThreshold: 768,  // Viewport width threshold for mobile behavior
      mobileDuration: 600,   // Shorter duration on mobile
      ...options
    };
    
    // Bind methods
    this.scrollTo = this.scrollTo.bind(this);
    this.scrollToElement = this.scrollToElement.bind(this);
    this.handleAnchorClick = this.handleAnchorClick.bind(this);
    
    // Set up easing functions
    this.easingFunctions = {
      // Linear - no easing
      linear: t => t,
      
      // Quadratic easing
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      
      // Cubic easing - smoother
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      
      // Exponential easing - even smoother
      easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
      easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
      easeInOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
      
      // Bounce effect
      easeOutBounce: t => {
        if (t < 1/2.75) {
          return 7.5625 * t * t;
        } else if (t < 2/2.75) {
          return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
        } else if (t < 2.5/2.75) {
          return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
        }
      },
    };
    
    // Init scrolling
    this.init();
    
    logger.debug('SmoothScroll initialized');
  }
  
  init() {
    // Attach event listeners to all anchor links
    document.addEventListener('DOMContentLoaded', () => {
      // Add click event listeners to all in-page anchor links
      document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', this.handleAnchorClick);
      });
      
      // Add custom class to all in-page links for styling
      document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.classList.add('smooth-scroll-link');
      });
      
      // Special handling for scroll indicator
      document.querySelectorAll('.scroll-indicator').forEach(indicator => {
        indicator.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = indicator.getAttribute('data-target');
          if (targetId) {
            this.scrollToElement(document.getElementById(targetId));
          }
        });
      });
      
      // Handle hash in URL on page load
      setTimeout(() => {
        if (window.location.hash) {
          const targetId = window.location.hash.substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            this.scrollToElement(targetElement);
          }
        }
      }, 100);
    });
    
    logger.debug('Smooth scroll handlers attached');
  }
  
  handleAnchorClick(e) {
    // Prevent default anchor click behavior
    e.preventDefault();
    
    // Get the href attribute
    const href = e.currentTarget.getAttribute('href');
    
    // Scroll to the target element
    const targetElement = document.querySelector(href);
    if (targetElement) {
      this.scrollToElement(targetElement);
      
      // Update URL hash without jumping
      if (history.pushState) {
        history.pushState(null, null, href);
      } else {
        // Fallback
        window.location.hash = href;
      }
    }
  }
  
  scrollToElement(element) {
    if (!element) {
      logger.warn('Target element not found');
      return;
    }
    
    // Calculate target position
    const rect = element.getBoundingClientRect();
    const targetY = window.pageYOffset + rect.top - this.calculateOffset();
    
    // Scroll to the target
    this.scrollTo(targetY);
  }
  
  calculateOffset() {
    // Calculate the scroll offset based on viewport size
    // Get header height dynamically if possible
    let headerHeight = 0;
    const header = document.querySelector('.md-header');
    if (header) {
      headerHeight = header.offsetHeight;
    }
    
    // Add custom offset
    let offset = headerHeight + this.options.offset;
    
    // Adjust for mobile
    if (window.innerWidth <= this.options.mobileThreshold) {
      offset += 10; // Add extra space on mobile
    }
    
    return offset;
  }
  
  scrollTo(targetY) {
    // Get current position
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    
    // If no distance, nothing to do
    if (distance === 0) return;
    
    // Determine scroll duration (shorter for shorter distances)
    let duration = this.options.duration;
    
    // Shorter duration on mobile
    if (window.innerWidth <= this.options.mobileThreshold) {
      duration = this.options.mobileDuration;
    }
    
    // Also adjust duration based on distance
    const distanceRatio = Math.abs(distance) / window.innerHeight;
    duration = Math.max(300, Math.min(duration, duration * distanceRatio));
    
    // Get easing function
    const easingFunction = this.easingFunctions[this.options.easing] || this.easingFunctions.easeInOutCubic;
    
    // Set up animation variables
    const startTime = performance.now();
    
    // Animation function
    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easingFunction(progress);
      
      // Set the new scroll position
      window.scrollTo(0, startY + distance * easedProgress);
      
      // If not finished, continue animation
      if (elapsedTime < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        // Ensure we end at exactly the right position
        window.scrollTo(0, targetY);
        
        // Execute callback if provided
        if (typeof this.options.callback === 'function') {
          this.options.callback();
        }
        
        logger.debug(`Completed scroll to ${targetY}px`);
      }
    };
    
    // Start the animation
    requestAnimationFrame(animateScroll);
  }
}

// Export as singleton
const smoothScroll = new SmoothScroll();
export default smoothScroll;
