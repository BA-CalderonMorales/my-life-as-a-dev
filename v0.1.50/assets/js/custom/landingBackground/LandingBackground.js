/**
 * LandingBackground.js
 * A minimal Three.js background component for the landing page
 */
import * as THREE from 'three';

export class LandingBackground {
  /**
   * Create a new LandingBackground
   * @param {string|HTMLElement} container - Container element or ID
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    // Get container element
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!this.container) {
      console.error('LandingBackground: Container element not found');
      return;
    }
    
    // Set default options
    this.options = Object.assign({
      particleCount: window.innerWidth > 768 ? 100 : 50,
      particleColor: 0x0088ff,
      lineColor: 0x0066cc,
      backgroundColor: 0x000000,
      particleSize: window.innerWidth > 768 ? 0.15 : 0.1,
      maxConnections: window.innerWidth > 768 ? 3 : 2,
      interactive: true
    }, options);
    
    // Animation properties
    this.animationId = null;
    this.isActive = false;
    this.frameCount = 0;
    
    // Mouse interaction
    this.mousePosition = { x: 0, y: 0 };
    this.lastMouseMoveTime = 0;
    this.mouseActive = false;
    
    // Initialize Three.js scene
    this.init();
  }
  
  /**
   * Initialize Three.js scene
   */
  init() {
    try {
      // Create canvas element
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'landing-background-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '-1';
      this.canvas.style.pointerEvents = 'none';
      this.container.appendChild(this.canvas);
      
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(this.options.backgroundColor);
      
      // Create camera
      this.camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      this.camera.position.z = 10;
      
      // Create renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Create particles
      this.createParticles();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('LandingBackground initialized successfully');
    } catch (error) {
      console.error('Error initializing LandingBackground:', error);
    }
  }
  
  /**
   * Create particles and lines
   */
  createParticles() {
    // Create particles
    this.particles = [];
    this.particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.options.particleCount * 3);
    
    for (let i = 0; i < this.options.particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        originalZ: z
      });
    }
    
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create particle material
    this.particleMaterial = new THREE.PointsMaterial({
      color: this.options.particleColor,
      size: this.options.particleSize,
      transparent: true,
      opacity: 0.8
    });
    
    // Create points mesh
    this.particlePoints = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particlePoints);
    
    // Create group for lines
    this.lineGroup = new THREE.Group();
    this.scene.add(this.lineGroup);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Mouse interaction
    if (this.options.interactive) {
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }
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
    // Skip this step every few frames for performance
    if (this.frameCount % 3 !== 0) {
      return;
    }
    
    // Remove existing lines
    while (this.lineGroup.children.length > 0) {
      this.lineGroup.remove(this.lineGroup.children[0]);
    }
    
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
        if (distance < 3 && connectionsCount < this.options.maxConnections) {
          // Create line geometry
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            particle1.position,
            particle2.position
          ]);
          
          // Set opacity based on distance - further = more transparent
          const lineOpacity = 1 - (distance / 3);
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
    
    // Update connections
    this.updateConnections();
    
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
      console.log('LandingBackground animation started');
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
      console.log('LandingBackground animation stopped');
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Stop animation
    this.stop();
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));
    if (this.options.interactive) {
      document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    }
    
    // Dispose of Three.js resources
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    
    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    console.log('LandingBackground disposed');
  }
}

export default LandingBackground;
