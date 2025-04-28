/**
 * ParticleInitializer.js
 * Manages particle background initialization
 */
import ParticleBackground from '../particleBackground/index.js';

class ParticleInitializer {
  constructor() {
    this.particleBackground = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the particle background
   * @returns {boolean} - Whether initialization was successful
   */
  initialize() {
    if (this.initialized) return true;
    
    try {
      console.log('Initializing particle background...');
      this.particleBackground = new ParticleBackground();
      this.particleBackground.start();
      console.log('Particle background started successfully');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize particle background:', error);
      return false;
    }
  }
  
  /**
   * Get the particle background instance
   * @returns {ParticleBackground|null} - The particle background instance
   */
  getParticleBackground() {
    return this.particleBackground;
  }
  
  /**
   * Check if particle background is initialized
   * @returns {boolean} - Whether the particle background is initialized
   */
  isInitialized() {
    return this.initialized;
  }
  
  /**
   * Stop the particle background
   */
  stop() {
    if (this.particleBackground && this.initialized) {
      this.particleBackground.stop();
    }
  }
}

export default ParticleInitializer;