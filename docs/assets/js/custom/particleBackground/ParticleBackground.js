/**
 * ParticleBackground.js
 * Main class that coordinates the particle animation system
 */
import ThemeDetector from './ThemeDetector.js';
import ParticleSystem from './ParticleSystem.js';

class ParticleBackground {
  /**
   * Creates a new particle background
   * @param {string} containerId - ID of the container element
   */
  constructor(containerId = 'particle-background') {
    // Ensure THREE is available globally
    if (typeof THREE === 'undefined') {
      console.error('THREE.js is not loaded. Make sure it is included before this script.');
      throw new Error('THREE.js is not available');
    }
    
    // Create container if needed
    this.initializeContainer(containerId);
    
    // Setup theme detection
    this.themeDetector = new ThemeDetector((isDarkMode) => {
      this.handleThemeChange(isDarkMode);
    });
    
    // Initialize THREE.js components
    this.initializeScene();
    
    // Set up animation
    this.animationId = null;
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
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 20;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
    
    // Create particle system
    this.particleSystem = new ParticleSystem(this.scene, this.themeDetector.isDark());
    
    // Set up resize listener
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * Handles window resize events
   */
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * Handles theme changes
   * @param {boolean} isDarkMode - Whether dark mode is enabled
   */
  handleThemeChange(isDarkMode) {
    console.log('Theme changed to:', isDarkMode ? 'dark' : 'light');
    this.particleSystem.updateTheme(isDarkMode);
  }
  
  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Update particles
    this.particleSystem.update();
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Starts the particle animation
   */
  start() {
    if (!this.animationId) {
      console.log('Starting particle animation');
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
    }
  }
}

export default ParticleBackground;