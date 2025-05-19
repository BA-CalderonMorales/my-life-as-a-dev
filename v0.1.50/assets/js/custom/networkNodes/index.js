/**
 * Network Nodes Module
 * 
 * This module exports the NetworkNodesAnimation class which creates an interactive
 * node network background animation for the landing page.
 */

import { NetworkNodesAnimation } from './NetworkNodesAnimation.js';

// Initialize the animation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Only run on landing page
  if (!document.body.classList.contains('landing-page')) {
    return;
  }
  
  const networkAnimation = new NetworkNodesAnimation();
  networkAnimation.initialize();
});

export { NetworkNodesAnimation };
