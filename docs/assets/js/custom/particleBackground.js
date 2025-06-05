"use strict";
/**
 * Main entry point for particle background
 * This file makes the ParticleBackground class available globally
 */

// Import Logger and create module-specific logger
import { Logger } from './logger.js';
const logger = new Logger({ 
  module: 'ParticleBackground',
  logLevel: 'info' 
});

// Import and re-export the ParticleBackground class
import ParticleBackground from './particleBackground/index.js';

// Make it available globally for backward compatibility
window.ParticleBackground = ParticleBackground;

// Log successful module loading
logger.debug('Module loaded successfully', 'moduleInit');

// Export as default
export default ParticleBackground;
