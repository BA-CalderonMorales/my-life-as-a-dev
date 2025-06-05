/**
 * ThreeBackground.js
 * Modern animated background using THREE.js with scroll interactions
 */
import * as THREE from 'three';
import { defaultLogger } from './logger.js';
import ThemeDetector from './particleBackground/ThemeDetector.js';

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

    // Theme detection
    this.themeDetector = new ThemeDetector(() => {
      this.applyThemeColors();
    });

    // Apply initial CSS-based colors
    this.applyThemeColors();

    // Animation properties
    this.animationId = null;
    this.time = 0;
    this.isRunning = false;
    this.clock = new THREE.Clock();
    
    // Initialize HTML elements
    this.initializeContainer();
    
    // Initialize THREE.js
    this.initializeScene();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Track scroll position for effects
    this.scrollY = 0;
    this.lastScrollY = 0;
    this.scrollVelocity = 0;
    
    // Track section positions for scroll interactions
    this.sections = [];
    this.activeSection = null;
    
    logger.debug('ThreeBackground initialized');
  }

  initializeContainer() {
    // Check if container exists
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      // Create container if it doesn't exist
      container = document.createElement('div');
      container.id = this.options.containerId;
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
        overflow: hidden;
      `;
      document.body.insertBefore(container, document.body.firstChild);
    }
    this.container = container;
  }

  initializeScene() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 25;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.innerWidth > 768, // Disable on mobile for performance
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    
    // Create particles
    this.createParticles();
  }

  createParticles() {
    // Particle group
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);
    
    // Create particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: this.options.particleColor,
      size: this.options.particleSize,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    // Get device pixel ratio but limit it for performance
    const dpr = Math.min(window.devicePixelRatio, 2);
    
    // Create particle texture for better appearance
    const particleTexture = this.createParticleTexture();
    particleMaterial.map = particleTexture;
    
    // Create particle positions
    const count = this.options.particleCount;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Set up particles with positions and velocities
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Particle position - distribute in a sphere
      const radius = 15 * (0.5 + Math.random() * 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Particle velocity - give them a small initial velocity
      velocities[i3] = (Math.random() - 0.5) * 0.05;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;

      // Particle color - slight variation
      const hue = 0.6 + Math.random() * 0.1; // Blue range
      const color = new THREE.Color().setHSL(hue, 1, 0.5 + Math.random() * 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    // Set attributes
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Store particle data for animation
    this.particlePositions = positions;
    this.particleVelocities = velocities;
    this.particleMaterial = particleMaterial;
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    
    // Add to scene
    this.particleGroup.add(this.particleSystem);

    // Line system for connections between particles
    this.linePositions = new Float32Array(this.options.maxConnections * count * 3 * 2);
    this.lineColors = new Float32Array(this.options.maxConnections * count * 3 * 2);
    this.lineGeometry = new THREE.BufferGeometry();
    
    // Set initial positions for lines
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.lineGeometry.setAttribute('color', new THREE.BufferAttribute(this.lineColors, 3));
    
    // Line material
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      color: this.options.lineColor,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    
    // Create line system and add to scene
    this.lineMaterial = lineMaterial;
    this.lineSystem = new THREE.LineSegments(this.lineGeometry, lineMaterial);
    this.particleGroup.add(this.lineSystem);
  }
  
  createParticleTexture() {
    // Create circular texture for particles
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    
    // Radial gradient
    const gradient = context.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(200, 200, 255, 0.8)');
    gradient.addColorStop(0.8, 'rgba(100, 100, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 100, 0)');
    
    // Draw circle
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, false);
    context.fill();
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Handle scroll events for parallax
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Handle mouse movement if interactive
    if (this.options.interactive) {
      window.addEventListener('mousemove', this.handleMouseMove.bind(this));
      window.addEventListener('touchmove', this.handleTouchMove.bind(this));
    }
    
    // Find sections for scroll interactions
    this.detectSections();
    
    // Update sections on DOM changes (for dynamic content)
    this.setupMutationObserver();
  }

  detectSections() {
    // Find major sections in the document to use for scroll effects
    const sectionElements = document.querySelectorAll(
      '.hero-section, .tabbed-experience, .featured-section, .final-cta'
    );
    
    // Store section info for scroll interactions
    this.sections = Array.from(sectionElements).map(element => {
      const rect = element.getBoundingClientRect();
      return {
        element,
        id: element.id,
        top: window.scrollY + rect.top,
        height: rect.height,
        bottom: window.scrollY + rect.bottom
      };
    });
    
    logger.debug(`Detected ${this.sections.length} sections for scroll interactions`);
  }
  
  setupMutationObserver() {
    // Watch for DOM changes and update section positions
    const observer = new MutationObserver(mutations => {
      let needsUpdate = false;
      
      // Check if any mutation affects our sections
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          needsUpdate = true;
          break;
        }
      }
      
      // Update sections if needed
      if (needsUpdate) {
        setTimeout(() => this.detectSections(), 300);
      }
    });
    
    // Observe the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  handleResize() {
    // Update camera aspect ratio
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update particle density based on screen size
    this.options.density = window.innerWidth > 768 ? 0.8 : 0.5;
    
    // Update section positions
    this.detectSections();
  }

  handleScroll(event) {
    // Store scroll position
    this.lastScrollY = this.scrollY;
    this.scrollY = window.scrollY;
    
    // Calculate scroll velocity for effects
    this.scrollVelocity = (this.scrollY - this.lastScrollY) * 0.05;
    
    // Find active section
    this.updateActiveSection();
    
    // Trigger scroll-based animations
    if (this.scrollVelocity !== 0) {
      this.animateOnScroll();
    }
  }
  
  updateActiveSection() {
    // Determine which section is currently in view
    const viewportHeight = window.innerHeight;
    const viewportMiddle = this.scrollY + viewportHeight / 2;
    
    let activeSection = null;
    
    for (const section of this.sections) {
      if (section.top <= viewportMiddle && section.bottom >= viewportMiddle) {
        activeSection = section;
        break;
      }
    }
    
    // Update active section if changed
    if (activeSection !== this.activeSection) {
      const oldSection = this.activeSection;
      this.activeSection = activeSection;
      
      // Trigger transition animation
      if (oldSection && activeSection) {
        this.triggerSectionTransition(oldSection, activeSection);
      }
    }
  }
  
  triggerSectionTransition(oldSection, newSection) {
    // Animate transition between sections
    // Add subtle particle burst
    this.addParticleBurst();
  }
  
  addParticleBurst() {
    // Increase particle velocities temporarily
    const count = this.particlePositions.length / 3;
    const burstStrength = 0.02;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Add random burst to velocity
      this.particleVelocities[i3] += (Math.random() - 0.5) * burstStrength;
      this.particleVelocities[i3 + 1] += (Math.random() - 0.5) * burstStrength;
      this.particleVelocities[i3 + 2] += (Math.random() - 0.5) * burstStrength;
    }
  }

  handleMouseMove(event) {
    // Calculate normalized mouse position
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Subtle camera movement based on mouse position
    if (this.camera) {
      // Smooth transition to new camera position
      gsap.to(this.camera.position, {
        x: mouseX * 2,
        y: mouseY * 2,
        duration: 1,
        ease: "power2.out"
      });
    }
  }
  
  handleTouchMove(event) {
    if (event.touches.length > 0) {
      // Similar to mouse move but for touch
      const touch = event.touches[0];
      const mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
      
      // Subtle camera movement
      if (this.camera) {
        gsap.to(this.camera.position, {
          x: mouseX * 2,
          y: mouseY * 2,
          duration: 1,
          ease: "power2.out"
        });
      }
    }
  }

  animateOnScroll() {
    // Apply scroll velocity to particle group rotation
    if (this.particleGroup) {
      // Rotate based on scroll direction and velocity
      gsap.to(this.particleGroup.rotation, {
        x: this.particleGroup.rotation.x - this.scrollVelocity * 0.01,
        y: this.particleGroup.rotation.y + this.scrollVelocity * 0.01,
        duration: 1,
        ease: "power2.out"
      });
    }
  }

  animate() {
    // Stop if not running
    if (!this.isRunning) return;
    
    // Request next frame
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Get elapsed time
    const delta = this.clock.getDelta();
    this.time += delta;
    
    // Track frame for performance optimization
    // Only update every N frames if in low performance mode
    if (!this.frameCounter) this.frameCounter = 0;
    this.frameCounter++;
    
    // Check if we should update this frame (for performance)
    const shouldUpdate = !this.isLowPerformanceMode || 
                        (this.frameCounter % this.options.updateFrequency === 0);
    
    if (shouldUpdate) {
      // Animate particles
      this.updateParticles(delta);
      
      // Update connections between particles
      this.updateConnections();
      
      // Apply subtle rotation to entire system - speed based on performance mode
      const rotationSpeed = this.isLowPerformanceMode ? 0.0005 : 0.001;
      this.particleGroup.rotation.y += rotationSpeed;
      
      // Apply camera effects based on active section
      this.updateCameraForSection();
    }
    
    // Always render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  updateCameraForSection() {
    if (!this.activeSection) return;
    
    // Different camera behaviors based on section
    if (this.activeSection.element.classList.contains('hero-section')) {
      // Subtle zoom for hero section
      this.camera.position.z = 25 + Math.sin(this.time * 0.5) * 0.5;
    } else if (this.activeSection.element.classList.contains('final-cta')) {
      // More dynamic movement for final CTA
      this.camera.position.z = 25 + Math.sin(this.time * 0.8) * 0.8;
    }
  }

  updateParticles(delta) {
    const positions = this.particlePositions;
    const velocities = this.particleVelocities;
    const count = positions.length / 3;
    
    // Apply scroll effect to all particles
    const scrollEffect = this.scrollVelocity * this.options.scrollFactor;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update positions based on velocity
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // Apply scroll velocity
      positions[i3 + 1] -= scrollEffect;
      
      // Dampen velocities over time (friction)
      velocities[i3] *= 0.99;
      velocities[i3 + 1] *= 0.99;
      velocities[i3 + 2] *= 0.99;
      
      // Contain particles in a sphere
      const distance = Math.sqrt(
        positions[i3] * positions[i3] +
        positions[i3 + 1] * positions[i3 + 1] +
        positions[i3 + 2] * positions[i3 + 2]
      );
      
      // If too far, push back toward center
      if (distance > 20) {
        velocities[i3] -= positions[i3] * 0.001;
        velocities[i3 + 1] -= positions[i3 + 1] * 0.001;
        velocities[i3 + 2] -= positions[i3 + 2] * 0.001;
      }
    }
    
    // Update geometry
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  updateConnections() {
    const positions = this.particlePositions;
    const colors = this.lineColors;
    const linePositions = this.linePositions;
    
    const count = positions.length / 3;
    const maxDistance = 5; // Maximum distance for connections
    const maxConnections = this.options.maxConnections;
    
    let lineIndex = 0;
    
    // Reset connection counter for each particle
    const connectionCounts = new Array(count).fill(0);
    
    // Check all pairs of particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ix = positions[i3];
      const iy = positions[i3 + 1];
      const iz = positions[i3 + 2];
      
      // Skip if already at max connections
      if (connectionCounts[i] >= maxConnections) continue;
      
      // Find nearest particles
      for (let j = i + 1; j < count; j++) {
        // Skip if target already at max connections
        if (connectionCounts[j] >= maxConnections) continue;
        
        const j3 = j * 3;
        const jx = positions[j3];
        const jy = positions[j3 + 1];
        const jz = positions[j3 + 2];
        
        // Calculate distance
        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Connect if close enough
        if (distance < maxDistance) {
          // Add line segment
          if (lineIndex < this.linePositions.length - 6) {
            // First point
            linePositions[lineIndex++] = ix;
            linePositions[lineIndex++] = iy;
            linePositions[lineIndex++] = iz;
            
            // Second point
            linePositions[lineIndex++] = jx;
            linePositions[lineIndex++] = jy;
            linePositions[lineIndex++] = iz;
            
            // Update connection counts
            connectionCounts[i]++;
            connectionCounts[j]++;
            
            // Exit if max connections reached
            if (connectionCounts[i] >= maxConnections) break;
          }
        }
      }
    }
    
    // Fill remaining line positions with zeros
    while (lineIndex < this.linePositions.length) {
      linePositions[lineIndex++] = 0;
    }
    
    // Update line geometry
    this.lineSystem.geometry.attributes.position.needsUpdate = true;
  }

  applyThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    const particleVar = styles.getPropertyValue('--three-particle-color').trim();
    const lineVar = styles.getPropertyValue('--three-line-color').trim();

    if (particleVar) {
      const color = new THREE.Color(particleVar);
      this.options.particleColor = color.getHex();
      if (this.particleMaterial) {
        this.particleMaterial.color.set(color);
      }
    }

    if (lineVar) {
      const color = new THREE.Color(lineVar);
      this.options.lineColor = color.getHex();
      if (this.lineMaterial) {
        this.lineMaterial.color.set(color);
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.clock.start();
      this.animate();
      logger.debug('ThreeBackground animation started');
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      this.clock.stop();
      if (this.animationId !== null) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      logger.debug('ThreeBackground animation stopped');
    }
  }
  
  /**
   * Check if background is currently active
   */
  isActive() {
    return this.isRunning;
  }
  
  /**
   * Set performance monitor for adaptive rendering
   */
  setPerformanceMonitor(monitor) {
    this.performanceMonitor = monitor;
    logger.debug('Performance monitor attached to ThreeBackground');
  }
  
  /**
   * Set low performance mode
   * @param {boolean} isLowPerf - Whether to enable low performance mode
   */
  setLowPerformanceMode(isLowPerf) {
    if (isLowPerf === this.isLowPerformanceMode) return;
    
    this.isLowPerformanceMode = isLowPerf;
    
    // Apply performance optimizations
    if (isLowPerf) {
      // Store original values
      this.originalOptions = {
        particleCount: this.options.particleCount,
        maxConnections: this.options.maxConnections,
        updateFrequency: this.options.updateFrequency
      };
      
      // Apply low performance settings
      this.options.particleCount = this.options.lowPerformanceParticleCount;
      this.options.maxConnections = this.options.lowPerformanceMaxConnections;
      this.options.updateFrequency = 2; // Update every other frame
      
      // Recreate particles with lower count
      this.recreateParticles();
      
      logger.info('ThreeBackground switched to low performance mode');
    } else if (this.originalOptions) {
      // Restore original settings
      this.options.particleCount = this.originalOptions.particleCount;
      this.options.maxConnections = this.originalOptions.maxConnections;
      this.options.updateFrequency = this.originalOptions.updateFrequency;
      
      // Recreate particles with original count
      this.recreateParticles();
      
      logger.info('ThreeBackground restored to normal performance mode');
    }
  }
  
  /**
   * Recreate particles with current settings
   */
  recreateParticles() {
    // Remove existing particles
    if (this.particleGroup) {
      this.scene.remove(this.particleGroup);
    }
    
    // Create new particles
    this.createParticles();
    
    logger.debug(`Particles recreated with count: ${this.options.particleCount}`);
  }
  
  dispose() {
    // Stop animation
    this.stop();
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchmove', this.handleTouchMove);
    
    // Dispose geometry
    if (this.particleSystem && this.particleSystem.geometry) {
      this.particleSystem.geometry.dispose();
    }
    
    if (this.lineSystem && this.lineSystem.geometry) {
      this.lineSystem.geometry.dispose();
    }
    
    // Dispose materials
    if (this.particleSystem && this.particleSystem.material) {
      this.particleSystem.material.dispose();
    }
    
    if (this.lineSystem && this.lineSystem.material) {
      this.lineSystem.material.dispose();
    }
    
    // Remove from DOM
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
    
    logger.debug('ThreeBackground disposed');
  }
}

export default ThreeBackground;
