/**
 * ParticleConfig.js
 * Configuration settings for the particle background system
 */

const ParticleConfig = {

  // Particle appearance
  particles: {
    count: 200,  // Reduced count for better performance
    size: {
      dark: 0.45,  // Slightly larger for better visibility
      light: 1.5  // Slightly larger for better visibility
    },
    color: {
      dark: 0x3370ab,  // Blueish color for space feel in dark mode
      light: 0x4a7cb9  // Blueish color for space feel in light mode
    },
    opacity: {
      dark: 0.8,
      light: 0.75
    }
  },
  
  // Connection lines
  connections: {
    maxDistance: 75,  // Increased distance for more connections
    maxPerParticle: 2,  // Increased connections for denser network
    color: {
      dark: 0x224f7d,  // Blueish color that complements particles
      light: 0x4a7cb9   // Blueish color that complements particles
    },
    opacity: {
      dark: 0.15,
      light: 0.12
    }
  },
  
  // Physics settings
  physics: {
    velocityFactor: 0.005,  // Reduced for smoother movement
    damping: 0.995,         // Higher value for more inertia
    boundary: 65,           // Larger space to move in
    minSpeed: 0.001,        // Ensure particles always move slightly
    maxSpeed: 0.05,         // Cap maximum speed
    // Space-like movement pattern
    flowField: {
      enabled: true,
      scale: 0.005,         // Scale of the noise field
      strength: 0.008       // Strength of the field effect
    }
  }
};

export default ParticleConfig;