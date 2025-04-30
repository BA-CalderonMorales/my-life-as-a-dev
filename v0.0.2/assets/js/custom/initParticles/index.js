/**
 * Particle Initialization Module
 * Entry point for particle background initialization
 */
import ParticleInitializer from './ParticleInitializer.js';

// Create a singleton instance
const initializer = new ParticleInitializer();

// Initialize when the DOM is fully loaded
function initializeParticles() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializer.initialize());
  } else {
    // If DOMContentLoaded has already fired
    initializer.initialize();
  }
}

// Set up global access to the particle system
window.particleSystem = {
  getInitializer: () => initializer,
  getBackground: () => initializer.getParticleBackground()
};

// Initialize on load
initializeParticles();

// Also ensure we catch theme changes on window load
window.addEventListener('load', () => {
  // Force an update after page has fully loaded
  setTimeout(() => initializer.initialize(), 200);
});

export default initializer;