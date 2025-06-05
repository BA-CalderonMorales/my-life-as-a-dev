"use strict";
/**
 * ThreeBackground.js
 * Modern animated background using THREE.js with scroll interactions
 */
import * as THREE from 'three';
import { defaultLogger } from './logger.js';

// Set up logger
const logger = defaultLogger.setModule('threeBackground');

class ThreeBackground {
  constructor(options = {}) {
    this.options = {
      containerId: 'three-background',
      interactive: true,
      scrollFactor: 0.05,
      backgroundColor: 0x202820,
      planeCount: window.innerWidth > 768 ? 20 : 10,
      planeSize: 0.5,
      planeColor: 0xffffff,
      trailColor: 0xffffff,
      updateFrequency: 1,                 // Update every frame by default
      ...options
    };

    // Load colors from CSS variables
    const styles = getComputedStyle(document.documentElement);
    const particleColor = styles.getPropertyValue('--three-particle-color').trim();
    const lineColor = styles.getPropertyValue('--three-line-color').trim();

    if (particleColor) {
      this.options.planeColor = new THREE.Color(particleColor);
    }

    if (lineColor) {
      this.options.trailColor = new THREE.Color(lineColor);
    }

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

    // Apply gradient background via CSS variables
    this.container.style.background =
      `linear-gradient(135deg, var(--three-bg-start) 0%, var(--three-bg-middle) 70%, var(--three-bg-end) 100%)`;

    // Create particles
    this.createParticles();
  }

  createParticles() {
    // Replace traditional particles with paper airplanes
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    const geometry = new THREE.ConeGeometry(this.options.planeSize, this.options.planeSize * 2, 3);
    geometry.rotateX(Math.PI / 2);

    this.planes = [];
    for (let i = 0; i < this.options.planeCount; i++) {
      const material = new THREE.MeshBasicMaterial({ color: this.options.planeColor });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30);
      plane.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);

      const trailGeom = new THREE.BufferGeometry();
      trailGeom.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0,0,0,0], 3));
      const trailMat = new THREE.LineBasicMaterial({ color: this.options.trailColor, transparent: true, opacity: 0.5 });
      const trail = new THREE.Line(trailGeom, trailMat);
      plane.userData.trail = trail;

      this.particleGroup.add(trail);
      this.particleGroup.add(plane);
      this.planes.push(plane);
    }
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
    const limit = 30;
    this.planes.forEach(plane => {
      plane.position.add(plane.userData.velocity);

      ['x', 'y', 'z'].forEach(axis => {
        if (plane.position[axis] > limit) plane.position[axis] = -limit;
        if (plane.position[axis] < -limit) plane.position[axis] = limit;
      });

      plane.rotation.z += delta;

      const start = plane.position.clone();
      const end = start.clone().sub(plane.userData.velocity.clone().multiplyScalar(10));
      const arr = plane.userData.trail.geometry.attributes.position.array;
      arr[0] = start.x; arr[1] = start.y; arr[2] = start.z;
      arr[3] = end.x; arr[4] = end.y; arr[5] = end.z;
      plane.userData.trail.geometry.attributes.position.needsUpdate = true;
    });
  }

  updateConnections() {
    // Trails are updated in updateParticles; nothing else to do here
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
        planeCount: this.options.planeCount,
        updateFrequency: this.options.updateFrequency
      };

      this.options.planeCount = Math.round(this.options.planeCount / 2);
      this.options.updateFrequency = 2; // Update every other frame
      
      // Recreate particles with lower count
      this.recreateParticles();
      
      logger.info('ThreeBackground switched to low performance mode');
    } else if (this.originalOptions) {
      // Restore original settings
      this.options.planeCount = this.originalOptions.planeCount;
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
    if (this.particleGroup) {
      this.scene.remove(this.particleGroup);
    }
    this.createParticles();
    logger.debug(`Particles recreated with count: ${this.options.planeCount}`);
  }
  
  dispose() {
    // Stop animation
    this.stop();

    // Clean up theme detector if present
    if (this.themeDetector && typeof this.themeDetector.dispose === 'function') {
      this.themeDetector.dispose();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchmove', this.handleTouchMove);
    
    // Dispose plane geometries and materials
    if (this.planes) {
      this.planes.forEach(p => {
        if (p.geometry) p.geometry.dispose();
        if (p.material) p.material.dispose();
        if (p.userData.trail) {
          if (p.userData.trail.geometry) p.userData.trail.geometry.dispose();
          if (p.userData.trail.material) p.userData.trail.material.dispose();
        }
      });
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
