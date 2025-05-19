/**
 * Module Registry
 * Central registry of all modules used in the application
 * 
 * This file serves as documentation of available modules and their purpose
 * It is not loaded directly but serves as a reference for developers
 */

export const moduleRegistry = {
  // Core modules - loaded on all pages
  core: {
    'logger': {
      description: 'Centralized logging system with different log levels',
      path: './custom/logger/index.js'
    },
    'versionSelector': {
      description: 'Handles documentation version selection',
      path: './custom/versionSelector/index.js'
    },
    'performanceMonitor': {
      description: 'Monitors and reports on page performance metrics',
      path: './custom/performanceMonitor/index.js',
      conditions: ['isDevelopment']
    }
  },
  
  // UI modules - mainly for landing pages
  ui: {
    'modernUI': {
      description: 'Modern UI features including animations, transitions and backgrounds',
      path: './custom/modernUI/index.js',
      conditions: ['isLandingPage']
    },
    'typewriter': {
      description: 'Typewriter effect for headings',
      path: './custom/typewriter/index.js',
      conditions: ['isLandingPage']
    },
    'particleBackground': {
      description: 'Interactive particle background system',
      path: './custom/particleBackground/index.js',
      conditions: ['hasParticleElements']
    },
    'threeBackground': {
      description: '3D background canvas using Three.js',
      path: './custom/threeBackground/index.js',
      conditions: ['isLandingPage', 'supportsWebGL']
    },
    'threeBackgroundFallback': {
      description: 'Fallback for 3D background when WebGL is not supported',
      path: './custom/threeBackgroundFallback/index.js',
      conditions: ['isLandingPage', '!supportsWebGL']
    },
    'networkNodes': {
      description: 'Interactive network node visualization background',
      path: './custom/networkNodes/index.js',
      conditions: ['isLandingPage']
    }
  },
  
  // Interaction modules - enhance user interaction
  interaction: {
    'smoothScroll': {
      description: 'Smooth scrolling functionality for page navigation',
      path: './custom/smoothScroll/index.js'
    },
    'scrollEffects': {
      description: 'Scroll-based animations and effects',
      path: './custom/scrollEffects/index.js',
      conditions: ['isLandingPage']
    },
    'sectionTransitions': {
      description: 'Handles section transitions and animations',
      path: './custom/sectionTransitions/index.js',
      conditions: ['isLandingPage']
    },
    'interactivityUtils': {
      description: 'Utilities for adding interactive elements',
      path: './custom/interactivityUtils/index.js'
    },
    'tabsHandler': {
      description: 'Handles tabbed content interfaces',
      path: './custom/tabsHandler/index.js'
    },
    'landingPage': {
      description: 'Landing page controller for coordinating UI components',
      path: './custom/landingPage/index.js',
      conditions: ['isLandingPage']
    }
  },
  
  // Component modules - loaded when specific data-component attributes are found
  components: {
    // Component modules are loaded dynamically based on data-component attributes
  }
};

export default moduleRegistry;
