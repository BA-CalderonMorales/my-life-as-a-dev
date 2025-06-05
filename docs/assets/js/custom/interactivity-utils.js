"use strict";
/**
 * Interactivity Utilities
 * 
 * This module provides helper functions to enhance canvas-based scenes with
 * proper touch and mouse interaction handling, including preventing scroll events
 * from propagating to the parent window when interacting within the scene.
 */

/**
 * Makes a canvas element fully interactive, preventing scroll events from bubbling up
 * when interacting with the canvas, while supporting both touch and mouse input.
 * 
 * @param {HTMLElement} container - The container element (usually a custom element or div)
 * @param {HTMLCanvasElement} canvas - The canvas element to make interactive 
 */
export function makeCanvasInteractive(container, canvas) {
  if (!container || !canvas) {
    console.error('Both container and canvas must be provided');
    return;
  }

  // Store original overflow settings
  const originalOverflow = document.body.style.overflow;
  
  // Prevent default touch actions to avoid browser's built-in behavior
  canvas.style.touchAction = 'none';
  
  // Prevent all default events that might cause scrolling
  const preventDefaultForEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  
  // Events that can cause scrolling
  const scrollEvents = [
    'touchstart', 'touchmove', 'touchend', 
    'mousedown', 'mousemove', 'mouseup', 
    'wheel', 'mousewheel', 'DOMMouseScroll'
  ];
  
  // Add event listeners to prevent scroll events from bubbling up
  scrollEvents.forEach(eventName => {
    canvas.addEventListener(eventName, preventDefaultForEvent, { passive: false });
  });

  // If we need to allow specific events, we can add custom handlers
  // For example, allowing click events:
  canvas.addEventListener('click', (e) => {
    // Let click events through but still prevent default
    e.stopPropagation();
  }, { passive: false });
  
  return {
    // Clean up function to remove all event listeners
    cleanup: () => {
      scrollEvents.forEach(eventName => {
        canvas.removeEventListener(eventName, preventDefaultForEvent);
      });
      document.body.style.overflow = originalOverflow;
    }
  };
}

/**
 * Applies interactive behavior to a canvas and prevents scroll events from
 * propagating to the parent window when inside the canvas
 * 
 * @param {HTMLElement} element - The custom element containing the canvas
 */
export function enhanceSceneInteractivity(element) {
  if (!element) return null;
  
  // Find the canvas inside the element
  const canvas = element.querySelector('canvas');
  if (!canvas) {
    console.error('Canvas element not found in the provided element');
    return null;
  }
  
  return makeCanvasInteractive(element, canvas);
}
