"use strict";
/**
 * background3D.js
 * Wrapper to initialize the Three.js animated background.
 */

import ThreeBackground from './threeBackground.js';
import backgroundFallback from './threeBackgroundFallback.js';
import performanceMonitor from './performanceMonitor.js';

let instance = null;

export function initBackground(options = {}) {
  // avoid multiple initializations
  if (instance) return instance;

  const useThree = !performanceMonitor.deviceInfo?.isLowEndDevice;
  if (!useThree) {
    backgroundFallback.init();
    backgroundFallback.start();
    return null;
  }

  instance = new ThreeBackground(options);
  if (instance.setPerformanceMonitor) {
    instance.setPerformanceMonitor(performanceMonitor);
  }
  instance.start();
  return instance;
}

export function disposeBackground() {
  if (instance && instance.dispose) {
    instance.dispose();
    instance = null;
  }
}

