/**
 * Fallback for THREE.js background if it fails to load
 * This provides a simpler CSS-based background effect
 */
import { defaultLogger } from '../logger/index.js';

// Set up logger
const logger = defaultLogger.setModule('threeBackgroundFallback');

class BackgroundFallback {
  constructor() {
    this.containerId = 'background-fallback';
    this.container = null;
    this.isInitialized = false;
    
    logger.debug('BackgroundFallback initialized');
  }
  
  init() {
    // Check if already initialized
    if (this.isInitialized) return;
    
    // Create container
    this.container = document.createElement('div');
    this.container.id = this.containerId;
    this.container.className = 'background-fallback';
    
    // Add dynamic elements for the effect
    this.container.innerHTML = `
      <div class="bg-gradient"></div>
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    `;
    
    // Add to DOM
    document.body.insertBefore(this.container, document.body.firstChild);
    
    // Add CSS if needed
    this.addFallbackCSS();
    
    this.isInitialized = true;
    logger.info('BackgroundFallback activated');
  }
  
  addFallbackCSS() {
    // Check if CSS already exists
    if (document.getElementById('background-fallback-css')) return;
    
    // Create stylesheet
    const style = document.createElement('style');
    style.id = 'background-fallback-css';
    
    // CSS for the fallback background
    style.textContent = `
      .background-fallback {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        overflow: hidden;
        pointer-events: none;
      }
      
      .bg-gradient {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          ellipse at center,
          rgba(var(--md-primary-fg-color--rgb), 0.1) 0%,
          rgba(var(--md-primary-fg-color--rgb), 0.05) 50%,
          transparent 100%
        );
      }
      
      .bg-shapes {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
      
      .shape {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(
          circle at center,
          rgba(var(--md-primary-fg-color--rgb), 0.2),
          rgba(var(--md-primary-fg-color--rgb), 0.1) 40%,
          transparent 70%
        );
        opacity: 0.3;
        animation: float 15s infinite ease-in-out;
      }
      
      .shape-1 {
        width: 300px;
        height: 300px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }
      
      .shape-2 {
        width: 200px;
        height: 200px;
        top: 60%;
        left: 20%;
        animation-delay: -3s;
      }
      
      .shape-3 {
        width: 350px;
        height: 350px;
        top: 40%;
        right: 10%;
        animation-delay: -6s;
      }
      
      .shape-4 {
        width: 250px;
        height: 250px;
        top: 20%;
        right: 20%;
        animation-delay: -9s;
      }
      
      .shape-5 {
        width: 400px;
        height: 400px;
        bottom: -100px;
        left: 50%;
        transform: translateX(-50%);
        animation-delay: -12s;
      }
      
      @keyframes float {
        0% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(-20px, 20px) scale(1.05);
        }
        100% {
          transform: translate(0, 0) scale(1);
        }
      }
      
      [data-md-color-scheme="slate"] .shape {
        opacity: 0.4;
      }
      
      [data-md-color-scheme="default"] .shape {
        opacity: 0.3;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .shape {
          animation: none;
        }
      }
    `;
    
    // Add to document head
    document.head.appendChild(style);
  }
  
  start() {
    // No animation to start, just make sure it's visible
    if (this.container) {
      this.container.style.display = 'block';
    } else {
      this.init();
    }
  }
  
  stop() {
    // Hide the container
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
  
  dispose() {
    // Remove from DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
      this.isInitialized = false;
    }
  }
}

export default BackgroundFallback;
