/**
 * Main entry point for particle initialization
 * This file initializes the particle background system
 */

// Wait for the ParticleBackground class to be available
function initializeWhenReady() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInitialize);
  } else {
    checkAndInitialize();
  }
  
  // Also try again after a short delay to ensure everything is loaded
  setTimeout(checkAndInitialize, 500);
}

// Function to check if ParticleBackground is loaded and initialize
function checkAndInitialize() {
  if (window.ParticleBackground) {
    try {
      console.log('Initializing particle background...');
      const particleBackground = new window.ParticleBackground();
      particleBackground.start();
      console.log('Particle background started successfully');
      
      // Store instance globally for potential later use
      window.activeParticleBackground = particleBackground;
    } catch (error) {
      console.error('Failed to initialize particle background:', error);
    }
  } else {
    console.log('ParticleBackground not available yet, waiting...');
    // Try again in a moment
    setTimeout(checkAndInitialize, 200);
  }
}

// Start the initialization process
initializeWhenReady();