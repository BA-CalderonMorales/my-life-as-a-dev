/**
 * Main entry point for particle background
 * This file makes the ParticleBackground class available globally
 */

// Import and re-export the ParticleBackground class
import ParticleBackground from './particleBackground/index.js';

// Make it available globally for backward compatibility
window.ParticleBackground = ParticleBackground;

// Log successful load
console.log('ParticleBackground module loaded successfully');

// Export as default
export default ParticleBackground;