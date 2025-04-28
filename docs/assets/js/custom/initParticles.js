/**
 * Main entry point for particle initialization
 * This file initializes the particle background system
 */

// Mobile detection function - now only used for adding a class, not for skipping initialization
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 1200;
}

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Add mobile device class if needed, but don't skip initialization
  if (isMobileDevice()) {
    console.log('Mobile device detected, adding mobile class');
    document.body.classList.add('is-mobile-device');
  }
  
  // Continue initialization for all devices
  loadParticleSystem();
});

function loadParticleSystem() {
  // Wait for the ParticleBackground class to be available
  function checkAndInitialize() {
    if (window.ParticleBackground) {
      try {
        console.log('Initializing particle background...');
        const particleBackground = new window.ParticleBackground();
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
    } else {
      console.log('ParticleBackground not available yet, waiting...');
      // Try again in a moment
      setTimeout(checkAndInitialize, 200);
    }
  }

  // Start the initialization process for all devices
  checkAndInitialize();
}