/**
 * ParticleBackground.js
 * Main class that coordinates the enhanced particle animation system
 */
import * as THREE from 'three';
import ThemeDetector from './ThemeDetector.js';
import ParticleSystem from './ParticleSystem.js';

class ParticleBackground {
  /**
   * Creates a new particle background
   * @param {HTMLElement|string} container - Container element or ID
   */
  constructor(container) {
    // Handle container parameter (can be element or ID string)
    if (typeof container === 'string') {
      // Create container if needed
      this.initializeContainer(container);
    } else if (container instanceof HTMLElement) {
      this.container = container;
    } else {
      // Default fallback
      this.initializeContainer('particles-background');
    }
    
    // Setup theme detection
    this.themeDetector = new ThemeDetector((isDarkMode) => {
      this.handleThemeChange(isDarkMode);
    });
    
    // Animation properties
    this.animationId = null;
    this.time = 0;
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.isRunning = false;
    
    // Store mobile status for optimizations but don't disable on mobile
    this.isMobile = this.detectMobileDevice();
    
    // Initialize THREE.js components
    this.initializeScene();
    
    // Add subtle camera movement
    this.setupCameraMovement();
  }
  
  /**
   * Mobile device detection - used for optimizations only
   * @returns {boolean} true if mobile device
   */
  detectMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth <= 768;
  }
  
  /**
   * Creates or finds the container element
   * @param {string} containerId - ID of the container element
   */
  initializeContainer(containerId) {
    // Check if container exists, if not create it
    if (!document.getElementById(containerId)) {
      const container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.zIndex = '-1';
      container.style.pointerEvents = 'none';
      document.body.prepend(container);
    }
    
    this.container = document.getElementById(containerId);
  }
  
  /**
   * Initializes the THREE.js scene and components
   */
  initializeScene() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera with better perspective
    this.camera = new THREE.PerspectiveCamera(
      60, // Wider field of view for more dramatic effect
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 25;
    
    // Create renderer with better settings
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: !this.isMobile, // Disable antialiasing on mobile for performance
      powerPreference: "high-performance"
    });
    
    // Set a lower pixel ratio on mobile devices for better performance
    if (this.isMobile) {
      this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    } else {
      this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
    
    // Create enhanced particle system
    this.particleSystem = new ParticleSystem(this.scene, this.themeDetector.isDark(), this.isMobile);
    
    // Set up resize listener
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * Set up subtle camera movement
   */
  setupCameraMovement() {
    // Store original camera position
    this.cameraOrigin = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
    
    // Camera movement configuration
    this.cameraMotion = {
      speed: 0.0003, // Very slow movement
      amplitude: this.isMobile ? 1 : 2, // Less movement on mobile
    };
  }
  
  /**
   * Update camera position for subtle movement
   */
  updateCamera() {
    if (!this.camera || !this.cameraMotion) return;
    
    // Very subtle sine wave movement
    const time = this.time * this.cameraMotion.speed;
    
    // Move in a small figure-8 pattern
    this.camera.position.x = this.cameraOrigin.x + Math.sin(time) * this.cameraMotion.amplitude;
    this.camera.position.y = this.cameraOrigin.y + Math.sin(time * 1.5) * this.cameraMotion.amplitude * 0.5;
    
    // Always look at the center of the scene
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * Handles window resize events
   */
  handleResize() {
    // Skip if not running
    if (!this.isRunning) return;
    
    // Update mobile status on resize
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobileDevice();
    
    // Update camera
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update camera movement based on mobile status
    if (wasMobile !== this.isMobile && this.cameraMotion) {
      this.cameraMotion.amplitude = this.isMobile ? 1 : 2;
    }
    
    // Update particle system
    if (this.particleSystem && this.particleSystem.updateMobileStatus) {
      this.particleSystem.updateMobileStatus(this.isMobile);
    }
  }
  
  /**
   * Handles theme changes
   * @param {boolean} isDarkMode - Whether dark mode is enabled
   */
  handleThemeChange(isDarkMode) {
    console.log('Theme changed to:', isDarkMode ? 'dark' : 'light');
    if (this.particleSystem) {
      this.particleSystem.updateTheme(isDarkMode);
    }
  }
  
  /**
   * Animation loop with frame rate control
   * @param {number} timestamp - Current animation frame timestamp
   */
  animate(timestamp) {
    this.time = timestamp || 0;
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Frame rate control
    const elapsed = this.time - this.lastFrameTime;
    
    // Only render if enough time has passed or it's the first frame
    if (elapsed >= this.frameInterval || this.lastFrameTime === 0) {
      // Update last frame time (with adjustment to maintain proper intervals)
      this.lastFrameTime = this.time - (elapsed % this.frameInterval);
      
      // Update camera position for subtle movement
      this.updateCamera();
      
      // Update particles
      this.particleSystem.update();
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * Starts the particle animation
   */
  start() {
    if (!this.isRunning && this.renderer) {
      console.log('Starting particle animation');
      this.isRunning = true;
      this.lastFrameTime = 0;
      this.animate();
    }
  }
  
  /**
   * Stops the particle animation
   */
  stop() {
    if (this.animationId) {
      console.log('Stopping particle animation');
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.isRunning = false;
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Dispose particle system
    if (this.particleSystem && typeof this.particleSystem.clear === 'function') {
      this.particleSystem.clear();
    }
    
    // Clean up theme detector
    if (this.themeDetector && typeof this.themeDetector.dispose === 'function') {
      this.themeDetector.dispose();
    }
  }
}

export default ParticleBackground;