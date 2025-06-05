"use strict";
/**
 * Main entry point for particle initialization
 * This file initializes the particle background system
 */

// Import the Logger
import { Logger } from './logger.js';
const logger = new Logger({ 
  module: 'ParticleInit',
  logLevel: 'info'
});

// Mobile detection function - now only used for adding a class, not for skipping initialization
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 1200;
}

// Check if we're in a development environment
function isDevelopmentEnvironment() {
  // Check if we're on localhost or a development server
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.includes('.dev.') || 
         hostname.includes('.local');
}

// Check URL parameters for explicit particle control
function shouldEnableParticles() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('particles')) {
    return urlParams.get('particles') === 'true';
  }
  // In development, default to no particles unless explicitly enabled
  if (isDevelopmentEnvironment()) {
    return false;
  }
  // In production, always show particles by default
  return true;
}

// Check if import map is ready
function isImportMapReady() {
  return !!document.querySelector('script[type="importmap"]');
}

// Safely import and initialize particles after ensuring import map is loaded
function safelyInitializeParticles() {
  // First check if import map exists
  if (!isImportMapReady()) {
    logger.debug('Import map not found, waiting for it to be ready...', 'safelyInitializeParticles');
    // Wait for import map to be loaded
    setTimeout(safelyInitializeParticles, 100);
    return;
  }
  
  // Now dynamically import the module to ensure import map is applied first
  import('./particleBackground.js')
    .then(module => {
      const ParticleBackground = module.default;
      try {
        logger.info('Initializing particle background...', 'safelyInitializeParticles');
        const particleBackground = new ParticleBackground();
        particleBackground.start();
        logger.info('Particle background started successfully', 'safelyInitializeParticles');
        
        // Store instance globally for potential later use
        window.activeParticleBackground = particleBackground;
        
        // Add listener to pause animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
          if (document.hidden && window.activeParticleBackground) {
            logger.debug('Page hidden, stopping animation', 'visibilityChangeHandler');
            window.activeParticleBackground.stop();
          } else if (!document.hidden && window.activeParticleBackground) {
            logger.debug('Page visible, resuming animation', 'visibilityChangeHandler');
            window.activeParticleBackground.start();
          }
        });
      } catch (error) {
        logger.error(`Failed to initialize particle background: ${error.message}`, 'safelyInitializeParticles');
      }
    })
    .catch(error => {
      logger.error(`Failed to load particle background module: ${error.message}`, 'safelyInitializeParticles');
    });
}

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Add mobile device class if needed
  if (isMobileDevice()) {
    logger.debug('Mobile device detected, adding mobile class', 'DOMContentLoaded');
    document.body.classList.add('is-mobile-device');
  }
  
  if (shouldEnableParticles()) {
    // Initialize particle system - using the safe initialization method
    safelyInitializeParticles();
  } else if (isDevelopmentEnvironment()) {
    logger.info('Particles disabled in development environment. Add ?particles=true to URL to enable.', 'DOMContentLoaded');
  }
});
