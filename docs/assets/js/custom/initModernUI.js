"use strict";
/**
 * Initialize simple modern UI features
 */

class ModernUI {
  constructor() {
    this.isLandingPage = this.detectLandingPage();
    this.intersectionObserver = null;
    
    if (this.isLandingPage) {
      this.init();
    }
  }
  
  detectLandingPage() {
    return document.body.classList.contains('landing-page') || 
           document.documentElement.classList.contains('landing-page') ||
           !!document.querySelector('.home-page-wrapper') || 
           !!document.querySelector('.home-page');
  }
  
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initFeatures());
    } else {
      this.initFeatures();
    }
  }
  
  initFeatures() {
    this.initProgressBar();
    this.initRevealAnimations();
    this.initScrollIndicator();
    this.updateCopyrightYear();
    this.setupScrollToTop();
  }
  
  initProgressBar() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollTop / scrollHeight * 100;
      progressBar.style.width = `${progress}%`;
    });
  }
  
  initRevealAnimations() {
    if (!('IntersectionObserver' in window)) return;
    
    const animatedElements = document.querySelectorAll(
      '.section-divider, .tabbed-experience, .featured-section, .final-cta, ' +
      '.section-title, .section-subtitle, .tagline, .feature-card'
    );
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });
    
    animatedElements.forEach(el => {
      el.classList.add('reveal-element');
      this.intersectionObserver.observe(el);
    });
  }
  
  initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    scrollIndicator.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = scrollIndicator.getAttribute('data-target');
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
    
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      
      if (scrollY > viewportHeight * 0.4) {
        scrollIndicator.classList.add('faded');
      } else {
        scrollIndicator.classList.remove('faded');
      }
    });
  }
  
  updateCopyrightYear() {
    const copyrightElement = document.querySelector('.copyright-year');
    if (copyrightElement) {
      copyrightElement.textContent = new Date().getFullYear().toString();
    }
  }
  
  setupScrollToTop() {
    if (document.querySelector('.scroll-to-top')) return;
    
    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.className = 'scroll-to-top';
    scrollToTopButton.setAttribute('aria-label', 'Scroll to top');
    scrollToTopButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
      </svg>
    `;
    document.body.appendChild(scrollToTopButton);
    
    scrollToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500) {
        scrollToTopButton.classList.add('visible');
      } else {
        scrollToTopButton.classList.remove('visible');
      }
    });
  }
}

// Initialize
const modernUI = new ModernUI();
export default modernUI;
