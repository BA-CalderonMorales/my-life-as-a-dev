/**
 * Main entry point for particle initialization
 * This file initializes the particle background system
 */
import ParticleBackground from './particleBackground.js';

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

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Add mobile device class if needed
  if (isMobileDevice()) {
    console.log('Mobile device detected, adding mobile class');
    document.body.classList.add('is-mobile-device');
  }
  
  if (shouldEnableParticles()) {
    // Initialize particle system
    initializeParticles();
  } else if (isDevelopmentEnvironment()) {
    console.log('Particles disabled in development environment. Add ?particles=true to URL to enable.');
  }
});

function initializeParticles() {
  try {
    console.log('Initializing particle background...');
    const particleBackground = new ParticleBackground();
    particleBackground.start();
    console.log('Particle background started successfully');
    
    // Store instance globally for potential later use
    window.activeParticleBackground = particleBackground;
    
    // Add listener to pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && window.activeParticleBackground) {
        window.activeParticleBackground.stop();
      } else if (!document.hidden && window.activeParticleBackground) {
        window.activeParticleBackground.start();
      }
    });
  } catch (error) {
    console.error('Failed to initialize particle background:', error);
  }
}