"use strict";
/**
 * Utility functions for Three.js theme colors
 */
import * as THREE from 'three';

export function readThreeColors() {
  const styles = getComputedStyle(document.documentElement);
  const plane = styles.getPropertyValue('--three-plane-color').trim();
  const trail = styles.getPropertyValue('--three-trail-color').trim();

  return {
    planeColor: plane ? new THREE.Color(plane) : new THREE.Color(0xffffff),
    trailColor: trail ? new THREE.Color(trail) : new THREE.Color(0xffffff)
  };
}

/**
 * Read primary and accent colors from the Material theme
 * @param {boolean} asThree Return THREE.Color objects when true
 */
export function readMaterialColors(asThree = false) {
  const styles = getComputedStyle(document.documentElement);
  const primary = styles.getPropertyValue('--md-primary-fg-color').trim();
  const accent = styles.getPropertyValue('--md-accent-fg-color').trim();

  if (asThree) {
    return {
      primaryColor: primary ? new THREE.Color(primary) : new THREE.Color(0xffffff),
      accentColor: accent ? new THREE.Color(accent) : new THREE.Color(0xffffff)
    };
  }

  return {
    primaryColor: primary || '#ffffff',
    accentColor: accent || '#ffffff'
  };
}

/**
 * Read the primary color in RGB format for rgba() usage
 */
export function readPrimaryRGB() {
  const styles = getComputedStyle(document.documentElement);
  const rgb = styles.getPropertyValue('--md-primary-fg-color--rgb').trim();
  return rgb || '255,255,255';
}
