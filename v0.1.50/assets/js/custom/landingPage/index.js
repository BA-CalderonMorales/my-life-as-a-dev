/**
 * Landing Page Module
 * 
 * This module exports the LandingPageController which manages the landing page functionality
 * using the MVVM pattern. It coordinates with other modules for scroll effects and animations.
 */

import { LandingPageController } from './LandingPageController.js';

// Re-export the LandingPageController
export { LandingPageController };

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const app = new LandingPageController();
  app.initialize();
});
