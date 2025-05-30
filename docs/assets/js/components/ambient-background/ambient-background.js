import * as THREE from 'three';
import { Logger } from '../../core/logger.js';

const logger = new Logger('ambient-background');

/**
 * Ambient Background
 * Creates a captivating three.js background with interactive particles
 */
export default class AmbientBackground {
  constructor(options = {}) {
    this.options = {
      containerId: 'three-background',
      particleCount: 500,
      particleSize: 2,
      depth: 100,
      speed: 0.05,
      responsive: true,
      colorMode: 'theme', // 'theme', 'rainbow', or 'custom'
      colors: [
        new THREE.Color('#4051b5'),
        new THREE.Color('#7e57c2'),
        new THREE.Color('#ff4081')
      ],
      ...options
    };

    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.particles = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    
    this.createContainer();
    this.init();
    this.animate();
    
    // Apply theme colors if specified
    if (this.options.colorMode === 'theme') {
      this.applyThemeColors();
      this.setupThemeChangeListener();
    }
    
    logger.info('Ambient background initialized');
  }
  
  createContainer() {
    // Check if container exists, create if not
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
      
      // Apply styles directly for immediate visibility
      container.style.position = 'fixed';
      container.style.top = 0;
      container.style.left = 0;
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.zIndex = '-1';
      container.style.pointerEvents = 'none';
      container.style.opacity = '0';
      
      // Fade in the background
      setTimeout(() => {
        container.style.transition = 'opacity 1s ease';
        container.style.opacity = '0.8';
      }, 100);
    }
    
    this.container = container;
  }

  init() {
    logger.debug('Initializing Three.js scene');
    
    this.scene = new THREE.Scene();
    
    // Use perspective camera with reasonable depth
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      1, 
      3000
    );
    this.camera.position.z = 1000;
    
    // Create particle system
    const particles = new THREE.BufferGeometry();
    const particleCount = this.options.particleCount;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    let n = 1000, n2 = n / 2;
    
    // Create particles with random positions and colors
    for (let i = 0; i < positions.length; i += 3) {
      positions[i]     = Math.random() * n - n2; // x
      positions[i + 1] = Math.random() * n - n2; // y
      positions[i + 2] = Math.random() * n - n2; // z
      
      // Color each particle
      const colorIndex = Math.floor(Math.random() * this.options.colors.length);
      const color = this.options.colors[colorIndex];
      colors[i]     = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
      
      // Random sizes for visual interest
      sizes[i / 3] = Math.random() * this.options.particleSize + 0.5;
    }
    
    // Add attributes to geometry
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material with transparency and color blending
    const material = new THREE.PointsMaterial({
      size: 5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    
    // Create the particle system
    this.particles = new THREE.Points(particles, material);
    this.scene.add(this.particles);
    
    // Create WebGL renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.container.appendChild(this.renderer.domElement);
    
    // Add event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));
  }
  
  applyThemeColors() {
    // Read colors from CSS variables
    const getColor = (varName) => {
      const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return new THREE.Color(color);
    };
    
    try {
      this.options.colors = [
        getColor('--particle-color-1'),
        getColor('--particle-color-2'),
        getColor('--particle-color-3')
      ];
      
      // Update particles with new colors
      if (this.particles) {
        const geometry = this.particles.geometry;
        const colorAttribute = geometry.getAttribute('color');
        const positions = geometry.getAttribute('position');
        
        for (let i = 0; i < positions.count; i++) {
          const colorIndex = Math.floor(Math.random() * this.options.colors.length);
          const color = this.options.colors[colorIndex];
          
          colorAttribute.setXYZ(i, color.r, color.g, color.b);
        }
        
        colorAttribute.needsUpdate = true;
      }
    } catch (e) {
      logger.error("Failed to apply theme colors", e);
    }
  }

  setupThemeChangeListener() {
    // Watch for theme changes (for dark/light mode)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-md-color-scheme') {
          this.applyThemeColors();
          logger.debug("Theme changed, updated particle colors");
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
  }
  
  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  onDocumentMouseMove(event) {
    // Track mouse position for parallax effect
    this.mouseX = (event.clientX - this.windowHalfX) * 0.05;
    this.mouseY = (event.clientY - this.windowHalfY) * 0.05;
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
  
  render() {
    // Gentle camera movement following mouse
    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.01;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.01;
    this.camera.lookAt(this.scene.position);
    
    // Rotate particle system
    if (this.particles) {
      this.particles.rotation.y += this.options.speed * 0.005;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  setOpacity(opacity) {
    if (this.particles && this.particles.material) {
      this.particles.material.opacity = opacity;
    }
  }
  
  destroy() {
    // Cleanup resources
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
    
    if (this.particles) {
      this.scene.remove(this.particles);
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
  }
}