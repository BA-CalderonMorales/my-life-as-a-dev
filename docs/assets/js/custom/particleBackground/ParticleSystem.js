"use strict";
/**
 * Manages the enhanced particle animation system
 */
import * as THREE from 'three';

class ParticleSystem {
  /**
   * Create a new particle system
   * @param {THREE.Scene} scene - The THREE.js scene
   * @param {boolean} isDark - Whether dark mode is enabled
   * @param {boolean} isMobile - Whether the device is mobile
   */
  constructor(scene, isDark, isMobile = false) {
    this.scene = scene;
    this.isDark = isDark;
    this.isMobile = isMobile;
    this.particles = [];
    
    // Increased count but still optimized for mobile
    this.count = isMobile ? 50 : 100;
    
    // Time factor for smooth animations
    this.time = 0;
    
    // Connection settings
    this.maxConnections = isMobile ? 3 : 5;
    this.maxDistance = 8;
    this.lineOpacity = isDark ? 0.15 : 0.1;
    
    // Color settings based on theme
    this.setThemeColors(isDark);
    
    // Initialize the particle system
    this.init();
  }
  
  /**
   * Set theme-based colors
   * @param {boolean} isDark - Whether dark mode is enabled
   */
  setThemeColors(isDark) {
    if (isDark) {
      // Dark theme - cooler blues with better contrast
      this.particleColor = 0x64b5f6;  // Material blue 300
      this.accentColor = 0x42a5f5;   // Material blue 400
      this.lineColor = 0x1e88e5;     // Material blue 600
    } else {
      // Light theme - deeper blues for better visibility
      this.particleColor = 0x2c5aa0;  // Deep blue
      this.accentColor = 0x1e3a8a;   // Darker blue
      this.lineColor = 0x4a7abd;     // Medium blue
    }
  }
  
  /**
   * Update mobile status when screen size changes
   * @param {boolean} isMobile - New mobile status
   */
  updateMobileStatus(isMobile) {
    if (this.isMobile !== isMobile) {
      this.isMobile = isMobile;
      // Update connection settings
      this.maxConnections = isMobile ? 3 : 5;
      // Rebuild particles with new count if mobile status changed
      this.clear();
      this.init();
    }
  }
  
  /**
   * Initialize the particle system
   */
  init() {
    // Create particles with improved visuals
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: this.particleColor,
      size: this.isMobile ? 0.6 : 1.0,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      // Add vertex colors for varied particles
      vertexColors: true,
      // Add texture for better looking particles
      map: this.generateParticleTexture(),
      depthWrite: false
    });
    
    // Generate random positions and colors
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const velocities = [];
    const sizes = new Float32Array(this.count);
    
    // Create a color object for manipulation
    const color = new THREE.Color();
    const baseColor = new THREE.Color(this.particleColor);
    const accentColor = new THREE.Color(this.accentColor);
    
    for (let i = 0; i < this.count; i++) {
      // Position - create a sphere of particles
      const radius = 15 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);     // x
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi); // y
      positions[i * 3 + 2] = radius * Math.cos(theta);                 // z
      
      // Velocity - more varied and slower for smoother motion
      const speed = 0.02 + Math.random() * 0.03;
      velocities.push({
        x: (Math.random() - 0.5) * speed,
        y: (Math.random() - 0.5) * speed,
        z: (Math.random() - 0.5) * speed,
        // Add rotation factors
        theta: (Math.random() - 0.5) * 0.001,
        phi: (Math.random() - 0.5) * 0.001
      });
      
      // Color - slightly vary the color for each particle
      const mixFactor = Math.random() * 0.4;
      color.copy(baseColor).lerp(accentColor, mixFactor);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size - vary the size for better visual effect
      sizes[i] = 0.5 + Math.random() * 0.5;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create the particle system
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particleSystem);
    
    // Store velocities for animation
    this.velocities = velocities;
    
    // Create lines for connections between particles
    this.createConnectionLines();
  }
  
  /**
   * Generate a nice circular particle texture
   * @returns {THREE.Texture} The particle texture
   */
  generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const context = canvas.getContext('2d');
    
    // Create a radial gradient for soft circle
    const gradient = context.createRadialGradient(
      32, 32, 0,
      32, 32, 32
    );
    
    // Soft white center fading to transparent edge
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    // Draw the particle
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
  
  /**
   * Create line objects for particle connections
   */
  createConnectionLines() {
    // Create lines geometry
    const lineGeometry = new THREE.BufferGeometry();
    
    // Maximum possible connections
    const maxPossibleConnections = this.isMobile ? this.count * 3 : this.count * 5;
    
    // Create position attribute for lines (each line has 2 vertices)
    const linePositions = new Float32Array(maxPossibleConnections * 6);
    
    // Create material for lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.lineColor,
      transparent: true,
      opacity: this.lineOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    // Set initial position attribute (will be updated each frame)
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    // Create line system
    this.lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.lineSystem);
    
    // Store max possible connections
    this.maxPossibleConnections = maxPossibleConnections;
  }
  
  /**
   * Clear particles from the scene
   */
  clear() {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
    }
    
    if (this.lineSystem) {
      this.scene.remove(this.lineSystem);
      this.lineSystem.geometry.dispose();
      this.lineSystem.material.dispose();
    }
  }
  
  /**
   * Update theme colors
   * @param {boolean} isDark - Whether dark mode is enabled
   */
  updateTheme(isDark) {
    this.isDark = isDark;
    this.setThemeColors(isDark);
    
    if (this.particleSystem) {
      this.particleSystem.material.color.set(this.particleColor);
    }
    
    if (this.lineSystem) {
      this.lineSystem.material.color.set(this.lineColor);
      this.lineSystem.material.opacity = this.lineOpacity;
    }
  }
  
  /**
   * Update particle positions and connections for animation
   */
  update() {
    this.time += 0.01;
    
    if (!this.particleSystem) return;
    
    const positions = this.particleSystem.geometry.attributes.position.array;
    
    // Use a lower frequency for updates on mobile
    const updateFrequency = this.isMobile ? 2 : 1;
    if (this.isMobile && Math.random() > 1/updateFrequency) return;
    
    // Update each particle position
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      
      // Current position 
      const x = positions[idx];
      const y = positions[idx + 1];
      const z = positions[idx + 2];
      
      // Calculate distance from center for orbital effect
      const distance = Math.sqrt(x*x + y*y + z*z);
      
      // Update position with velocity and add slight orbital rotation
      positions[idx] += this.velocities[i].x + 
        Math.sin(this.time * 0.3 + i * 0.05) * 0.02;
        
      positions[idx + 1] += this.velocities[i].y + 
        Math.cos(this.time * 0.2 + i * 0.04) * 0.02;
        
      positions[idx + 2] += this.velocities[i].z;
      
      // Apply very subtle orbital rotation around center
      const theta = Math.atan2(y, x) + this.velocities[i].theta;
      const phi = Math.acos(z / distance) + this.velocities[i].phi;
      
      // Maintain distance from center (orbital effect)
      const targetDistance = 15 + Math.sin(this.time * 0.1 + i * 0.2) * 2;
      const currentDistance = Math.sqrt(
        positions[idx]**2 + 
        positions[idx+1]**2 + 
        positions[idx+2]**2
      );
      
      // Slowly adjust to target distance
      const factor = 0.005;
      const distanceFactor = 1 + (targetDistance - currentDistance) * factor;
      
      positions[idx] *= distanceFactor;
      positions[idx+1] *= distanceFactor;
      positions[idx+2] *= distanceFactor;
      
      // Clamp to maximum bounds
      const maxBound = 30;
      if (Math.abs(positions[idx]) > maxBound) {
        positions[idx] *= 0.95;
      }
      if (Math.abs(positions[idx + 1]) > maxBound) {
        positions[idx + 1] *= 0.95;
      }
      if (Math.abs(positions[idx + 2]) > maxBound) {
        positions[idx + 2] *= 0.95;
      }
    }
    
    // Mark the attribute as needing an update
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    
    // Update connections between particles
    this.updateConnections(positions);
  }
  
  /**
   * Update connections between particles
   * @param {Float32Array} positions - Particle positions array
   */
  updateConnections(positions) {
    if (!this.lineSystem) return;
    
    const linePositions = this.lineSystem.geometry.attributes.position.array;
    let connectionCount = 0;
    
    // Find connections between particles
    for (let i = 0; i < this.count && connectionCount < this.maxPossibleConnections; i++) {
      const ix = positions[i * 3];
      const iy = positions[i * 3 + 1];
      const iz = positions[i * 3 + 2];
      
      // Count connections for this particle
      let connectionsForThisParticle = 0;
      
      // Look for nearby particles to connect with
      for (let j = i + 1; j < this.count; j++) {
        // Stop if we've reached max connections for this particle
        if (connectionsForThisParticle >= this.maxConnections) break;
        
        const jx = positions[j * 3];
        const jy = positions[j * 3 + 1];
        const jz = positions[j * 3 + 2];
        
        // Calculate distance between particles
        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // If within connection distance, add line
        if (distance < this.maxDistance) {
          // Add connection
          const lineIndex = connectionCount * 6;
          
          // First vertex (particle i)
          linePositions[lineIndex] = ix;
          linePositions[lineIndex + 1] = iy;
          linePositions[lineIndex + 2] = iz;
          
          // Second vertex (particle j)
          linePositions[lineIndex + 3] = jx;
          linePositions[lineIndex + 4] = jy;
          linePositions[lineIndex + 5] = jz;
          
          connectionCount++;
          connectionsForThisParticle++;
          
          // Break if we've reached the maximum possible connections
          if (connectionCount >= this.maxPossibleConnections) break;
        }
      }
    }
    
    // Clear any remaining connections if fewer are used this frame
    for (let i = connectionCount * 6; i < this.maxPossibleConnections * 6; i++) {
      linePositions[i] = 0;
    }
    
    // Mark line positions as needing update
    this.lineSystem.geometry.attributes.position.needsUpdate = true;
  }
}

export default ParticleSystem;
