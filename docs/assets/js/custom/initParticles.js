"use strict";
/**
 * Simple background initialization
 * Just loads the network nodes background
 */

// Simple mobile detection for optimization
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;
}

// Initialize background when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Add mobile class for CSS optimizations
  if (isMobileDevice()) {
    document.body.classList.add('is-mobile-device');
  }
  
  // The network nodes will initialize themselves via their own DOMContentLoaded listener
  console.log('Background system ready');
});
