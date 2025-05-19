/**
 * Scroll Effects Module
 * 
 * This module exports the MVVM components for scroll-based animations and effects
 * used throughout the site, particularly on the landing page.
 */

import { ScrollModel, ScrollView, ScrollViewModel, scrollEffectsViewModel } from './ScrollEffects.js';

// Re-export the components
export { ScrollModel, ScrollView, ScrollViewModel, scrollEffectsViewModel };

// Initialize the MVVM components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // The initialization happens in the ScrollEffects.js file
  // to ensure the exports are valid, but we'll check again here
  if (!scrollEffectsViewModel) {
    const model = new ScrollModel();
    const view = new ScrollView();
    scrollEffectsViewModel = new ScrollViewModel(model, view);
  }
});
