/**
 * Main entry point for particle background
 * This file makes the ParticleBackground class available globally
 */

// Define a global ParticleBackground variable that will be populated when the module loads
window.ParticleBackground = null;

// Import the module dynamically
import('./particleBackground/index.js')
  .then(module => {
    // Make ParticleBackground available globally
    window.ParticleBackground = module.default;
    console.log('ParticleBackground module loaded successfully');
  })
  .catch(error => {
    console.error('Failed to load ParticleBackground module:', error);
  });