/**
 * ThreeBackground.js
 * Modern animated background using THREE.js with scroll interactions
 */
import * as THREE from 'three';
import { defaultLogger } from '../logger/index.js';
import { distanceBetweenPoints, generateRandomVertices, mapRange, easing } from './ThreeUtils.js';

// Set up logger
const logger = defaultLogger.setModule('threeBackground');

class ThreeBackground {
  constructor(options = {}) {
    this.options = {
      containerId: 'three-background',
      interactive: true,
      density: window.innerWidth > 768 ? 0.8 : 0.5, // Lower density on mobile
      scrollFactor: 0.05,
      particleSize: window.innerWidth > 768 ? 0.15 : 0.1,
      particleColor: 0x0088ff,
      lineColor: 0x0066cc,
      backgroundColor: 0x000000,
      particleCount: window.innerWidth > 768 ? 150 : 80, // Fewer particles on mobile
      maxConnections: window.innerWidth > 768 ? 5 : 3,  // Fewer connections on mobile
      lowPerformanceParticleCount: 60,    // Lower particle count for low-end devices
      lowPerformanceMaxConnections: 2,    // Fewer connections for low-end devices
      updateFrequency: 1,                 // Update every frame by default
      ...options
    };

    // Animation properties
    this.animationId = null;
    this.isActive = false;
    this.frameCount = 0;
    this.lowPerformanceMode = false;
    this.performanceMonitor = null;
    
    // Mouse interaction
    this.mousePosition = { x: 0, y: 0 };
    this.lastMouseMoveTime = 0;
    this.mouseActive = false;
    
    // Initialize
    this.init();
    
    logger.debug('ThreeBackground initialized with options', this.options);
  }
  
  /**
   * Initialize Three.js scene
   */
  init() {
    try {
      // Create container if it doesn't exist
      this.createContainer();
      
      // Create THREE scene, camera, renderer
      this.createScene();
      this.createCamera();
      this.createRenderer();
      
      // Create particles and lines
      this.createParticles();
      
      // Set up event listeners
      this.setupEventListeners();
      
      logger.info('THREE.js background initialized successfully');
    } catch (error) {
      logger.error('Error initializing THREE.js background:', error);
      throw error;
    }
  }
  
  /**
   * Create container element for THREE.js canvas
   */
  createContainer() {
    // Check if container already exists
    this.container = document.getElementById(this.options.containerId);
    
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = this.options.containerId;
      this.container.className = 'three-background';
      this.container.style.position = 'fixed';
      this.container.style.top = '0';
      this.container.style.left = '0';
      this.container.style.width = '100%';
      this.container.style.height = '100%';
      this.container.style.zIndex = '-1';
      this.container.style.pointerEvents = 'none';
      document.body.prepend(this.container);
    }
  }
  
  /**
   * Create THREE.js scene
   */
  createScene() {
    this.scene = new THREE.Scene();
    
    // Set scene background color
    if (this.options.backgroundColor !== null) {
      this.scene.background = new THREE.Color(this.options.backgroundColor);
    } else {
      this.scene.background = null;
    }
  }
  
  /**
   * Create THREE.js camera
   */
  createCamera() {
    // Perspective camera with 75° FOV, window aspect ratio, and clipping planes
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // Position camera
    this.camera.position.z = 10;
  }
  
  /**
   * Create THREE.js renderer
   */
  createRenderer() {
    // Create WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !this.lowPerformanceMode // Disable antialiasing in low performance mode
    });
    
    // Set renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1); // Limit max pixel ratio
    
    // Append renderer to container
    this.container.appendChild(this.renderer.domElement);
  }
  
  /**
   * Create particles and lines
   */
  createParticles() {
    // Particle count based on performance mode
    const particleCount = this.lowPerformanceMode
      ? this.options.lowPerformanceParticleCount
      : this.options.particleCount;
    
    // Create particles
    this.particles = [];
    this.particleConnections = [];
    
    // Particle material
    this.particleMaterial = new THREE.PointsMaterial({
      color: this.options.particleColor,
      size: this.options.particleSize,
      transparent: true,
      opacity: 0.8,
      // Disabled in low performance mode for better performance
      blending: this.lowPerformanceMode ? THREE.NormalBlending : THREE.AdditiveBlending
    });
    
    // Line material
    this.lineMaterial = new THREE.LineBasicMaterial({
      color: this.options.lineColor,
      transparent: true,
      opacity: 0.5,
      blending: this.lowPerformanceMode ? THREE.NormalBlending : THREE.AdditiveBlending
    });
    
    // Particle geometry
    this.particleGeometry = new THREE.BufferGeometry();
    
    // Generate particle positions and velocities
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in 3D space
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      
      // Set positions in buffer
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Store particle data
      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02, // x velocity
          (Math.random() - 0.5) * 0.02, // y velocity
          (Math.random() - 0.5) * 0.02  // z velocity
        ),
        originalZ: z
      });
    }
    
    // Set positions attribute
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create points mesh
    this.particlePoints = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particlePoints);
    
    // Create group for lines
    this.lineGroup = new THREE.Group();
    this.scene.add(this.lineGroup);
    
    logger.debug(`Created ${particleCount} particles`);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Resize listener
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Mouse move listener for interactivity
    if (this.options.interactive) {
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));
      document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    }
    
    // Scroll listener
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Update camera aspect ratio
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    logger.debug('Resized THREE.js background');
  }
  
  /**
   * Handle mouse movement
   */
  handleMouseMove(event) {
    // Track mouse position as normalized coordinates (-1 to 1)
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Track when mouse was last moved
    this.lastMouseMoveTime = Date.now();
    this.mouseActive = true;
  }
  
  /**
   * Handle touch movement
   */
  handleTouchMove(event) {
    if (event.touches.length > 0) {
      // Prevent default to avoid scrolling
      event.preventDefault();
      
      // Track touch position as normalized coordinates (-1 to 1)
      this.mousePosition.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      
      // Track when touch was last moved
      this.lastMouseMoveTime = Date.now();
      this.mouseActive = true;
    }
  }
  
  /**
   * Handle page scroll
   */
  handleScroll() {
    // Calculate scroll progress (0 to 1)
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.scrollProgress = scrollTop / scrollHeight;
  }
  
  /**
   * Update particle positions
   */
  updateParticles() {
    // Update particle positions based on velocities
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Update position based on velocity
      particle.position.add(particle.velocity);
      
      // Bounds checking - bounce off invisible walls
      if (Math.abs(particle.position.x) > 10) {
        particle.velocity.x *= -1;
      }
      if (Math.abs(particle.position.y) > 10) {
        particle.velocity.y *= -1;
      }
      if (Math.abs(particle.position.z) > 10) {
        particle.velocity.z *= -1;
      }
      
      // Apply mouse influence if mouse is active
      if (this.mouseActive && Date.now() - this.lastMouseMoveTime < 2000) {
        // Create a subtle mouse attraction/repulsion effect
        const mouseStrength = 0.0003;
        const mouseVector = new THREE.Vector3(
          this.mousePosition.x * 10,
          this.mousePosition.y * 10,
          0
        );
        
        // Calculate direction to/from mouse
        const direction = new THREE.Vector3().subVectors(mouseVector, particle.position);
        const distance = direction.length();
        
        // Normalize and scale by distance (closer = stronger)
        if (distance > 0.1) {
          direction.normalize();
          
          // Alternate between attraction/repulsion based on particle index
          const factor = i % 2 === 0 ? 1 : -1;
          direction.multiplyScalar((mouseStrength * factor) / Math.max(0.1, distance * 0.1));
          
          // Apply to velocity
          particle.velocity.add(direction);
        }
      }
      
      // Apply scroll influence
      if (this.scrollProgress !== undefined) {
        // Subtle z-position shift based on scroll
        const scrollInfluence = (this.scrollProgress - 0.5) * this.options.scrollFactor;
        particle.position.z = particle.originalZ + scrollInfluence;
      }
      
      // Update array positions for geometry
      this.particleGeometry.attributes.position.array[i * 3] = particle.position.x;
      this.particleGeometry.attributes.position.array[i * 3 + 1] = particle.position.y;
      this.particleGeometry.attributes.position.array[i * 3 + 2] = particle.position.z;
    }
    
    // Mark positions as needing update
    this.particleGeometry.attributes.position.needsUpdate = true;
  }
  
  /**
   * Update connecting lines between particles
   */
  updateConnections() {
    // Skip this step every N frames in low performance mode
    if (this.lowPerformanceMode && this.frameCount % 3 !== 0) {
      return;
    }
    
    // Remove existing lines
    while (this.lineGroup.children.length > 0) {
      this.lineGroup.remove(this.lineGroup.children[0]);
    }
    
    // Max connections based on performance mode
    const maxConnections = this.lowPerformanceMode
      ? this.options.lowPerformanceMaxConnections
      : this.options.maxConnections;
    
    // Map of already connected particles to avoid duplicates
    const connectedPairs = new Map();
    
    // Check particles for proximity
    for (let i = 0; i < this.particles.length; i++) {
      const particle1 = this.particles[i];
      let connectionsCount = 0;
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const particle2 = this.particles[j];
        
        // Skip if already connected
        const pairKey = `${i}-${j}`;
        if (connectedPairs.has(pairKey)) {
          continue;
        }
        
        // Calculate distance
        const distance = particle1.position.distanceTo(particle2.position);
        
        // Create line if particles are close enough and below max connections
        if (distance < 5 * this.options.density && connectionsCount < maxConnections) {
          // Create line geometry
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            particle1.position,
            particle2.position
          ]);
          
          // Set opacity based on distance - further = more transparent
          const lineOpacity = 1 - (distance / (5 * this.options.density));
          const material = new THREE.LineBasicMaterial({
            color: this.options.lineColor,
            transparent: true,
            opacity: Math.min(0.5, lineOpacity)
          });
          
          // Create line and add to scene
          const line = new THREE.Line(lineGeometry, material);
          this.lineGroup.add(line);
          
          // Mark pair as connected
          connectedPairs.set(pairKey, true);
          connectionsCount++;
        }
      }
    }
  }
  
  /**
   * Animation loop
   */
  animate() {
    // Increment frame counter
    this.frameCount++;
    
    // Update particles every frame
    this.updateParticles();
    
    // Update connections (only every updateFrequency frames in low performance mode)
    if (!this.lowPerformanceMode || this.frameCount % this.options.updateFrequency === 0) {
      this.updateConnections();
    }
    
    // Rotate entire scene for subtle motion
    this.particlePoints.rotation.y += 0.001;
    this.lineGroup.rotation.y += 0.001;
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Continue animation loop if active
    if (this.isActive) {
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
  }
  
  /**
   * Start animation
   */
  start() {
    if (!this.isActive) {
      this.isActive = true;
      this.animationId = requestAnimationFrame(this.animate.bind(this));
      logger.debug('THREE.js background animation started');
    }
  }
  
  /**
   * Stop animation
   */
  stop() {
    if (this.isActive) {
      this.isActive = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      logger.debug('THREE.js background animation stopped');
    }
  }
  
  /**
   * Set performance monitor
   */
  setPerformanceMonitor(monitor) {
    this.performanceMonitor = monitor;
  }
  
  /**
   * Set low performance mode
   */
  setLowPerformanceMode(isLowPerf) {
    // Skip if no change
    if (this.lowPerformanceMode === isLowPerf) {
      return;
    }
    
    this.lowPerformanceMode = isLowPerf;
    
    // Apply performance optimizations
    if (isLowPerf) {
      logger.info('Entering low performance mode');
      
      // Must stop and recreate everything for particle count changes to take effect
      const wasActive = this.isActive;
      this.stop();
      
      // Clear scene
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
      
      // Recreate with optimized settings
      this.createParticles();
      
      // Restart if it was active before
      if (wasActive) {
        this.start();
      }
    } else {
      logger.info('Exiting low performance mode');
      
      // Must stop and recreate everything for particle count changes to take effect
      const wasActive = this.isActive;
      this.stop();
      
      // Clear scene
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
      
      // Recreate with normal settings
      this.createParticles();
      
      // Restart if it was active before
      if (wasActive) {
        this.start();
      }
    }
  }
}

export default ThreeBackground;
