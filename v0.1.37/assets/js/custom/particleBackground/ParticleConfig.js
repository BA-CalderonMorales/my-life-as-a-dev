/**
 * Configuration settings for the particle background
 */
class ParticleConfig {
  constructor() {
    // Common settings
    this.common = {
      particleCount: 80,
      particleColor: '#ffffff',
      lineColor: '#ffffff',
      lineDistance: 150,
      directionX: 0,
      directionY: 0,
      density: 6000,
      backgroundAlpha: 1
    };

    // Settings specific to default/light theme
    this.default = {
      particleColor: '#225588',
      lineColor: '#225588',
      particleOpacity: 0.5,
      lineOpacity: 0.2,
      particleSize: 2
    };

    // Settings specific to dark/slate theme
    this.slate = {
      particleColor: '#aaccff',
      lineColor: '#aaccff',
      particleOpacity: 0.6,
      lineOpacity: 0.2,
      particleSize: 2
    };

    // Mobile specific settings - significantly reduced for better performance
    this.mobile = {
      particleCount: 20,  // Reduced from 30
      lineDistance: 80,   // Reduced from 100
      density: 10000,
      particleSize: 1.5,
      particleOpacity: 0.4,
      lineOpacity: 0.1
    };
    
    // Settings for very small screens or low-power devices
    this.lowPower = {
      particleCount: 10,
      lineDistance: 60,
      density: 12000,
      particleSize: 1,
      particleOpacity: 0.3,
      lineOpacity: 0.05
    };
  }

  /**
   * Get config based on theme and device
   * @param {string} theme - The current theme ('default' or 'slate')
   * @param {boolean} isMobile - Whether the device is mobile
   * @returns {Object} - The combined configuration
   */
  getConfig(theme, isMobile) {
    const themeConfig = this[theme] || this.default;
    const config = { ...this.common, ...themeConfig };
    
    // Apply mobile optimizations
    if (isMobile) {
      // Check if it's an extra small screen
      if (window.innerWidth < 480) {
        return { ...config, ...this.mobile, ...this.lowPower };
      }
      return { ...config, ...this.mobile };
    }
    
    return config;
  }
}

export default ParticleConfig;