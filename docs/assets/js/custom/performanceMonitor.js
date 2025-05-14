/**
 * Performance monitoring for animations and THREE.js
 * Helps optimize rendering based on device capabilities
 */
import { defaultLogger } from './logger.js';

// Set up logger
const logger = defaultLogger.setModule('performanceMonitor');

class PerformanceMonitor {
  constructor() {
    this.frameRates = [];
    this.frameRateHistory = [];
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.measureInterval = 1000; // 1 second intervals
    this.lastMeasureTime = this.lastFrameTime;
    this.isMonitoring = false;
    this.averageFrameRate = 60;
    this.minAcceptableFrameRate = 45;
    this.lowPerfMode = false;
    this.veryLowPerfMode = false;
    this.callbackFunctions = {
      onLowPerformance: null,
      onVeryLowPerformance: null,
      onGoodPerformance: null
    };

    // Device detection
    this.deviceInfo = this.detectDevice();
    logger.debug('PerformanceMonitor initialized', this.deviceInfo);
  }

  /**
   * Detect device capabilities
   */
  detectDevice() {
    const info = {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isLowEndDevice: false,
      deviceMemory: navigator.deviceMemory || 4, // Default to 4GB if not available
      cpuCores: navigator.hardwareConcurrency || 4 // Default to 4 cores if not available
    };

    // Check for low-end device indicators
    info.isLowEndDevice = info.isMobile && 
                          ((info.deviceMemory && info.deviceMemory <= 4) || 
                           (info.cpuCores && info.cpuCores <= 4));

    return info;
  }

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.lastMeasureTime = this.lastFrameTime;
    this.frameCount = 0;
    this.frameRates = [];
    
    // Initial performance mode based on device
    if (this.deviceInfo.isLowEndDevice) {
      this.lowPerfMode = true;
      logger.info('Low-end device detected, starting in low performance mode');
      this.executeCallback('onLowPerformance');
    }
    
    logger.debug('Performance monitoring started');
    this.monitorFrame();
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring() {
    this.isMonitoring = false;
    logger.debug('Performance monitoring stopped');
  }

  /**
   * Monitor frame rate and update performance mode
   */
  monitorFrame() {
    if (!this.isMonitoring) return;
    
    // Calculate frame time
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    // Increment frame count
    this.frameCount++;
    
    // Calculate frame rate if enough time has passed
    if (now - this.lastMeasureTime >= this.measureInterval) {
      const elapsedTime = now - this.lastMeasureTime;
      const currentFrameRate = Math.round((this.frameCount * 1000) / elapsedTime);
      
      // Store frame rate
      this.frameRates.push(currentFrameRate);
      
      // Keep only the last 5 measurements
      if (this.frameRates.length > 5) {
        this.frameRates.shift();
      }
      
      // Calculate average frame rate
      this.averageFrameRate = this.frameRates.reduce((sum, rate) => sum + rate, 0) / this.frameRates.length;
      
      // Store in history (for debugging)
      this.frameRateHistory.push({
        timestamp: now,
        frameRate: this.averageFrameRate
      });
      
      // Keep history limited
      if (this.frameRateHistory.length > 20) {
        this.frameRateHistory.shift();
      }
      
      // Update performance mode if needed
      this.updatePerformanceMode();
      
      // Reset for next interval
      this.lastMeasureTime = now;
      this.frameCount = 0;
    }
    
    // Continue monitoring
    requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * Update performance mode based on frame rate
   */
  updatePerformanceMode() {
    const previousLowPerfMode = this.lowPerfMode;
    const previousVeryLowPerfMode = this.veryLowPerfMode;
    
    // Check if performance is low
    if (this.averageFrameRate < this.minAcceptableFrameRate) {
      this.lowPerfMode = true;
      
      // Check if performance is very low
      if (this.averageFrameRate < 20) {
        this.veryLowPerfMode = true;
      }
    } else if (this.averageFrameRate > this.minAcceptableFrameRate + 10) {
      // Only switch back to high performance if we're significantly above minimum
      this.lowPerfMode = false;
      this.veryLowPerfMode = false;
    }
    
    // Execute callbacks if mode changed
    if (previousLowPerfMode !== this.lowPerfMode || previousVeryLowPerfMode !== this.veryLowPerfMode) {
      if (this.veryLowPerfMode) {
        logger.warn(`Performance very low: ${Math.round(this.averageFrameRate)} FPS - activating very low performance mode`);
        this.executeCallback('onVeryLowPerformance');
      } else if (this.lowPerfMode) {
        logger.info(`Performance low: ${Math.round(this.averageFrameRate)} FPS - activating low performance mode`);
        this.executeCallback('onLowPerformance');
      } else {
        logger.info(`Performance good: ${Math.round(this.averageFrameRate)} FPS - activating standard mode`);
        this.executeCallback('onGoodPerformance');
      }
    }
  }

  /**
   * Set callback for performance mode changes
   */
  setCallbacks(callbacks) {
    this.callbackFunctions = {...this.callbackFunctions, ...callbacks};
  }

  /**
   * Execute a callback if it exists
   */
  executeCallback(callbackName) {
    if (this.callbackFunctions[callbackName] && typeof this.callbackFunctions[callbackName] === 'function') {
      this.callbackFunctions[callbackName]();
    }
  }
}

// Export a singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
