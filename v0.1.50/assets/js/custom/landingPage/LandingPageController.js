/**
 * LandingPage Controller
 * 
 * This file contains the main controller for the landing page that coordinates the 
 * MVVM components and initializes the landing page functionality.
 */

import { defaultLogger } from '../logger/index.js';
import { ScrollModel, AnimationModel, ContentModel } from './LandingPageModels.js';
import { ScrollViewModel, AnimationViewModel, ContentViewModel } from './LandingPageViewModels.js';

// Load scrollEffects module dynamically to avoid circular dependencies
let scrollEffectsModule = null;
try {
  // Dynamic import to avoid circular dependencies
  import('../scrollEffects/index.js').then(module => {
    scrollEffectsModule = module;
  }).catch(err => {
    console.error('Error importing scrollEffects.js:', err);
  });
} catch (error) {
  console.error('Error setting up scrollEffects import:', error);
}

// Initialize module logger
const logger = defaultLogger.setModule('landingPage');

/**
 * LandingPageController - Main controller for the landing page
 */
export class LandingPageController {
  constructor() {
    // Initialize models
    this.scrollModel = new ScrollModel();
    this.animationModel = new AnimationModel();
    this.contentModel = new ContentModel();

    // Initialize viewModels
    this.scrollViewModel = new ScrollViewModel(this.scrollModel);
    this.animationViewModel = new AnimationViewModel(this.animationModel);
    this.contentViewModel = new ContentViewModel(this.contentModel);
  }

  initialize() {
    logger.info('Initializing landing page controller', 'initialize');

    // Check if we're on the home page/landing page
    const isHomePage = document.querySelector('.md-content__inner.home-page') || 
                      document.querySelector('.home-page');
    
    if (!isHomePage) {
      logger.info('Not on home page, skipping initialization', 'initialize');
      return;
    }
    
    // Mark this as a landing page for other scripts (like scrollEffects.js)
    if (!document.documentElement.classList.contains('landing-page')) {
      document.documentElement.classList.add('landing-page');
    }

    // Initialize components
    this.scrollViewModel.initialize();
    this.animationViewModel.initialize();
    this.contentViewModel.initialize();

    // If we're on the landing page, ensure scroll effects are triggered
    try {
      // Add a small delay to ensure DOM elements are fully rendered
      setTimeout(() => {
        // Force scroll event to update progress bar and parallax
        window.dispatchEvent(new Event('scroll'));
        logger.debug('Dispatched initial scroll event', 'initialize');
      }, 200);
    } catch (error) {
      logger.error(`Error dispatching initial scroll event: ${error.message}`, 'initialize');
    }

    logger.info('Landing page controller initialized', 'initialize');
  }
}
