/**
 * ParticleSystem.js
 * Handles the creation and management of particles
 */
import ParticleConfig from './ParticleConfig.js';

class ParticleSystem {
  /**
   * Creates a new particle system
   * @param {THREE.Scene} scene - THREE.js scene to add particles to
   * @param {boolean} isDarkMode - Current theme state
   */
  constructor(scene, isDarkMode) {
    // Ensure THREE is available globally
    if (typeof THREE === 'undefined') {
      console.error('THREE.js is not loaded. Make sure it is included before this script.');
      return;
    }

    this.scene = scene;
    this.isDarkMode = isDarkMode;
    this.particlePositions = [];
    this.time = 0; // For smooth animation
    
    // Create noise for fluid motion
    this.noise = {
      simplex: null,
      init: () => {
        // Simple noise implementation for fluid motion
        this.noise.simplex = {
          noise2D: (x, y) => {
            // Simple 2D noise function for fluid motion
            const X = Math.floor(x) & 255;
            const Y = Math.floor(y) & 255;
            const fx = x - Math.floor(x);
            const fy = y - Math.floor(y); // Fixed missing parenthesis
            
            const s = (fx*fx*(3-2*fx) + fy*fy*(3-2*fy)) * 0.5;
            const a = Math.sin(X + Y * 57.295) * 43758.5453;
            const b = Math.sin(X + 1 + Y * 57.295) * 43758.5453;
            
            return a + (b-a) * s;
          }
        };
      }
    };
    
    // Initialize noise
    this.noise.init();
    
    // Initialize the particle system
    this.createParticles();
    this.createConnectionLines();
  }
  
  /**
   * Creates the particles
   */
  createParticles() {
    const particleCount = ParticleConfig.particles.count;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Create random positions for particles with more depth
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in a more spherical pattern for space-like feel
      const theta = Math.random() * Math.PI * 2; // Angle around y-axis
      const phi = Math.acos((Math.random() * 2) - 1); // Angle from y-axis
      const radius = 30 + Math.random() * 50; // Varying distances
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) - 40; // Offset for camera position
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Store reference with initial velocities
      this.particlePositions.push({
        x, y, z,
        vx: (Math.random() * 2 - 1) * 0.01, // Small initial velocity
        vy: (Math.random() * 2 - 1) * 0.01,
        vz: (Math.random() * 2 - 1) * 0.01,
        size: 0.5 + Math.random() * 0.5 // Varying sizes
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create material based on current theme
    const config = ParticleConfig.particles;
    const material = new THREE.PointsMaterial({
      size: this.isDarkMode ? config.size.dark : config.size.light,
      color: this.isDarkMode ? config.color.dark : config.color.light,
      transparent: true,
      opacity: this.isDarkMode ? config.opacity.dark : config.opacity.light,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true // Particles change size with distance
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  /**
   * Creates lines connecting particles
   */
  createConnectionLines() {
    // Create line geometry
    const lineGeometry = new THREE.BufferGeometry();
    
    // Material for lines
    const config = ParticleConfig.connections;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.isDarkMode ? config.color.dark : config.color.light,
      transparent: true,
      opacity: this.isDarkMode ? config.opacity.dark : config.opacity.light,
      blending: THREE.AdditiveBlending,
      vertexColors: false
    });
    
    // Create initial empty line segments
    this.connectionLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.connectionLines);
  }
  
  /**
   * Get a flow field vector at position (x,y,z)
   * Creates a space-like fluid motion effect
   */
  getFlowFieldVector(x, y, z, time) {
    const config = ParticleConfig.physics.flowField;
    if (!config.enabled) return { x: 0, y: 0, z: 0 };
    
    const scale = config.scale;
    const strength = config.strength;
    
    // Use noise to create a flowing field effect
    const angle1 = this.noise.simplex.noise2D(x * scale, y * scale + time) * Math.PI * 2;
    const angle2 = this.noise.simplex.noise2D(y * scale, z * scale + time) * Math.PI * 2;
    const angle3 = this.noise.simplex.noise2D(z * scale, x * scale + time) * Math.PI * 2;
    
    return {
      x: Math.cos(angle1) * strength,
      y: Math.cos(angle2) * strength,
      z: Math.sin(angle3) * strength
    };
  }
  
  /**
   * Updates the particle colors based on theme
   * @param {boolean} isDarkMode - Current theme state
   */
  updateTheme(isDarkMode) {
    this.isDarkMode = isDarkMode;
    
    // Update particle material
    if (this.particles && this.particles.material) {
      const material = this.particles.material;
      const config = ParticleConfig.particles;
      
      material.color.setHex(isDarkMode ? config.color.dark : config.color.light);
      material.size = isDarkMode ? config.size.dark : config.size.light;
      material.opacity = isDarkMode ? config.opacity.dark : config.opacity.light;
      material.needsUpdate = true;
    }
    
    // Update connection line colors
    if (this.connectionLines) {
      const lineMaterial = this.connectionLines.material;
      const config = ParticleConfig.connections;
      
      lineMaterial.color.setHex(isDarkMode ? config.color.dark : config.color.light);
      lineMaterial.opacity = isDarkMode ? config.opacity.dark : config.opacity.light;
      lineMaterial.needsUpdate = true;
    }
  }
  
  /**
   * Update the positions of particles
   */
  update() {
    if (!this.particles) return;
    
    // Increment time for smooth animation
    this.time += 0.002;
    
    const positions = this.particles.geometry.attributes.position.array;
    const config = ParticleConfig.physics;
    
    // Update each particle with fluid motion
    for (let i = 0; i < this.particlePositions.length; i++) {
      const particle = this.particlePositions[i];
      
      // Get flow field influence for space-like motion
      const flow = this.getFlowFieldVector(particle.x, particle.y, particle.z, this.time);
      
      // Apply flow field
      particle.vx += flow.x;
      particle.vy += flow.y;
      particle.vz += flow.z;
      
      // Add slight random movement (reduced for smoother motion)
      particle.vx += (Math.random() - 0.5) * config.velocityFactor * 0.5;
      particle.vy += (Math.random() - 0.5) * config.velocityFactor * 0.5;
      particle.vz += (Math.random() - 0.5) * config.velocityFactor * 0.25;
      
      // Apply damping for smoother motion
      particle.vx *= config.damping;
      particle.vy *= config.damping;
      particle.vz *= config.damping;
      
      // Ensure minimum velocity for constant motion
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy + particle.vz * particle.vz);
      if (speed < config.minSpeed) {
        const scale = config.minSpeed / (speed + 0.0001);
        particle.vx *= scale;
        particle.vy *= scale;
        particle.vz *= scale;
      }
      
      // Cap maximum speed
      if (speed > config.maxSpeed) {
        const scale = config.maxSpeed / speed;
        particle.vx *= scale;
        particle.vy *= scale;
        particle.vz *= scale;
      }
      
      // Update position using velocity
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;
      
      // Contain particles within boundaries with smooth wraparound
      const bound = config.boundary;
      if (Math.abs(particle.x) > bound) {
        // Gentle wraparound to opposite side
        particle.x = -particle.x * 0.98;
        particle.vx *= -0.5; // Reduce velocity on wraparound for smoothness
      }
      if (Math.abs(particle.y) > bound) {
        particle.y = -particle.y * 0.98;
        particle.vy *= -0.5;
      }
      if (Math.abs(particle.z) > bound) {
        particle.z = -particle.z * 0.98;
        particle.vz *= -0.5;
      }
      
      // Update the actual particle position array
      positions[i * 3] = particle.x;
      positions[i * 3 + 1] = particle.y;
      positions[i * 3 + 2] = particle.z;
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.updateConnections();
  }
  
  /**
   * Updates the connection lines between particles
   */
  updateConnections() {
    if (!this.connectionLines) return;
    
    const linePositions = [];
    const config = ParticleConfig.connections;
    
    // Calculate connections based on distance
    for (let i = 0; i < this.particlePositions.length; i++) {
      let connectionCount = 0;
      
      // Find nearest neighbors to create more meaningful connections
      // Sort by distance first to get best connections
      const neighbors = [];
      for (let j = 0; j < this.particlePositions.length; j++) {
        if (i === j) continue;
        
        const pi = this.particlePositions[i];
        const pj = this.particlePositions[j];
        
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const dz = pi.z - pj.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < config.maxDistance) {
          neighbors.push({ index: j, distance });
        }
      }
      
      // Sort by distance and take only closest ones
      neighbors.sort((a, b) => a.distance - b.distance);
      const connectCount = Math.min(neighbors.length, config.maxPerParticle);
      
      // Connect to nearest neighbors
      for (let k = 0; k < connectCount; k++) {
        const j = neighbors[k].index;
        const pi = this.particlePositions[i];
        const pj = this.particlePositions[j];
        
        linePositions.push(pi.x, pi.y, pi.z);
        linePositions.push(pj.x, pj.y, pj.z);
        connectionCount++;
      }
    }
    
    // Update line geometry
    this.connectionLines.geometry.setAttribute(
      'position', 
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    
    this.connectionLines.geometry.attributes.position.needsUpdate = true;
  }
}

export default ParticleSystem;