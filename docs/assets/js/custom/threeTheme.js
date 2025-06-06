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
