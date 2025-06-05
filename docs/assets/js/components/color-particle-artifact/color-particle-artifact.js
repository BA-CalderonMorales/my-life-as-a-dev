"use strict";
/**
 * Color Particle Artifact Component
 * 
 * A visualization featuring colorful particles with interactive elements,
 * combining 2D canvas with THREE.js for the network effect.
 */

// Try to import the logger and interactivity utils, but provide fallbacks in case it fails
let logger;
let interactivityUtils;

try {
  const module = await import('../../custom/logger.js').catch(() => 
    import('/assets/js/custom/logger.js')
  );
  logger = module.defaultLogger;
  
  // Import interactivity utilities
  interactivityUtils = await import('../../custom/interactivity-utils.js').catch(() => 
    import('/assets/js/custom/interactivity-utils.js')
  );
} catch (err) {
  // Fallback logger if import fails
  logger = {
    setModule: () => {},
    enableLogs: () => {},
    setLogLevel: () => {},
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };
  
  // Fallback empty interactivity utils
  interactivityUtils = {
    makeCanvasInteractive: () => ({ cleanup: () => {} }),
    enhanceSceneInteractivity: () => null
  };
}

// Import THREE.js from the import map
import * as THREE from 'three';

class ColorParticleArtifact extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <canvas id="particleCanvas"></canvas>
      <div id="fps">FPS: --</div>
    `;
    
    // Initialize state
    this.container = this; // The container is the component itself
    this.canvas = this.querySelector('#particleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.fpsEl = this.querySelector('#fps');
    
    // Set canvas dimensions
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Track fps
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    
    // Particle system properties
    this.particles = [];
    this.colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF4500', '#00FF00', '#1E90FF'];
    this.connections = [];
    this.userInteractionCount = 0;
    this.logs = [];
    
    // Initialize particles
    this.init();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply interactivity utils if available
    if (interactivityUtils && interactivityUtils.makeCanvasInteractive) {
      this.interactivityCleanup = interactivityUtils.makeCanvasInteractive(this.container, this.canvas);
      console.log('Canvas interactivity applied to Color Particle Artifact');
    }
    
    // Start animation loop
    this.animate(performance.now());
    
    // Log initialization
    if (window.DEBUG_COLOR_PARTICLE) {
      console.log('Color Particle Artifact initialized');
    }
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  init() {
    // Create particles
    for (let i = 0; i < 100; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  createParticle(x, y) {
    return {
      x: x !== undefined ? x : Math.random() * this.canvas.width,
      y: y !== undefined ? y : Math.random() * this.canvas.height,
      size: Math.random() * 5 + 1,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      velocityX: Math.random() * 2 - 1,
      velocityY: Math.random() * 2 - 1,
      opacity: Math.random() * 0.5 + 0.5,
      // Add 3D-like properties for network effect
      z: Math.random() * 100,
      connections: []
    };
  }
  
  setupEventListeners() {
    // Log events
    const log = (e) => {
      this.logs.push({ t: Date.now(), type: e.type });
    };
    
    // Note: The interactivity utils will handle the prevention of scroll events,
    // but we still need to set up our specific interaction handlers
    
    // Mouse interactions
    this.canvas.addEventListener('mousemove', (e) => {
      log(e);
      this.handleMouseMove(e);
      // No need to call preventDefault or stopPropagation here as the interactivity utils will handle that
    });
    
    this.canvas.addEventListener('click', (e) => {
      log(e);
      this.handleClick(e);
    });
    
    // Touch interactions - with the interactivity utils in place, we still need these
    // for our specific particle behavior but not for preventing scrolling
    this.canvas.addEventListener('touchmove', (e) => {
      log(e);
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        // Convert touch to mousemove-like event with correct coordinates
        this.handleMouseMove({
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        // No need to call preventDefault here as interactivity utils will handle it
      }
    }, { passive: false });
    
    this.canvas.addEventListener('touchstart', (e) => {
      log(e);
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        // Convert touch to click-like event with correct coordinates
        this.handleClick({
          clientX: touch.clientX,
          clientY: touch.clientY
        });
      }
    });
    
    // Device motion for particle bursts
    window.addEventListener('devicemotion', (e) => {
      log(e);
      const a = e.accelerationIncludingGravity || e.acceleration;
      if (a) {
        const m = Math.hypot(a.x, a.y, a.z);
        if (m > 20) {
          // Add particles in response to shaking
          for (let i = 0; i < 10; i++) {
            this.particles.push(this.createParticle());
          }
        }
      }
    });
    
    // Send logs on page unload
    window.addEventListener('beforeunload', () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/log', JSON.stringify(this.logs));
      }
    });
  }
  
  handleMouseMove(e) {
    // Get canvas-relative coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX !== undefined ? e.clientX : e.offsetX) - rect.left;
    const y = (e.clientY !== undefined ? e.clientY : e.offsetY) - rect.top;
    
    this.particles.forEach((particle) => {
      const dx = x - particle.x;
      const dy = y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        // Particles are attracted to the mouse
        particle.velocityX = dx / 20;
        particle.velocityY = dy / 20;
        
        // Make particles glow when interacted with
        particle.size = Math.min(particle.size * 1.05, 8);
      }
    });
  }
  
  handleClick(e) {
    // Get canvas-relative coordinates using the same method as handleMouseMove
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX !== undefined ? e.clientX : e.offsetX) - rect.left;
    const y = (e.clientY !== undefined ? e.clientY : e.offsetY) - rect.top;
    
    // Add particles on click
    for (let i = 0; i < 5; i++) {
      this.particles.push(this.createParticle(
        x + (Math.random() * 50 - 25),
        y + (Math.random() * 50 - 25)
      ));
    }
    
    // Track user interaction for adaptive behavior
    this.userInteractionCount++;
    if (this.userInteractionCount % 5 === 0) {
      for (let i = 0; i < 10; i++) {
        this.particles.push(this.createParticle());
      }
    }
  }
  
  updateConnections() {
    // Clear previous connections
    this.connections = [];
    
    // Find connections between particles that are close to each other
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      p1.connections = [];
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        
        // Calculate distance between particles (pseudo-3D)
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Connect particles that are close enough
        if (distance < 150) {
          this.connections.push({
            p1,
            p2,
            distance,
            opacity: 1 - distance / 150
          });
          
          p1.connections.push(p2);
          p2.connections.push(p1);
        }
      }
    }
  }
  
  drawConnections() {
    // Draw connections between particles
    this.connections.forEach(conn => {
      this.ctx.beginPath();
      this.ctx.moveTo(conn.p1.x, conn.p1.y);
      this.ctx.lineTo(conn.p2.x, conn.p2.y);
      this.ctx.strokeStyle = `rgba(100, 150, 255, ${conn.opacity * 0.2})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });
  }
  
  animate(timestamp) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set background
    this.ctx.fillStyle = 'rgba(7, 10, 20, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update FPS counter
    this.frameCount++;
    if (timestamp - this.lastFpsUpdate >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
      this.fpsEl.textContent = `FPS: ${fps}`;
      this.lastFpsUpdate = timestamp;
      this.frameCount = 0;
    }
    
    // Update and find connections
    this.updateConnections();
    
    // Draw connections first (so particles are on top)
    this.drawConnections();
    
    // Update and draw particles
    this.particles.forEach((particle) => {
      // Update position
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.z += (Math.random() - 0.5) * 0.5; // Slight z-axis movement
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.velocityX *= -1;
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.velocityY *= -1;
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
      }
      
      // Keep z within bounds
      if (particle.z < 0 || particle.z > 100) {
        particle.z = Math.max(0, Math.min(100, particle.z));
      }
      
      // Add friction to gradually slow particles
      particle.velocityX *= 0.99;
      particle.velocityY *= 0.99;
      
      // Gradually normalize particle size
      if (particle.size > 5) {
        particle.size -= 0.05;
      }
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      
      // Create glow effect for particles
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      // Draw particle center
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
      
      // Draw glow
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = gradient;
      this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    });
    
    // Continue animation loop
    requestAnimationFrame((time) => this.animate(time));
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    window.removeEventListener('resize', this.resize);
    
    // Clean up interactivity handlers
    if (this.interactivityCleanup) {
      this.interactivityCleanup.cleanup();
    }
    
    // More cleanup if needed
    this.particles = [];
    this.connections = [];
  }
}

// Register the custom element
customElements.define('color-particle-artifact', ColorParticleArtifact);

// Export the component
export default ColorParticleArtifact;
