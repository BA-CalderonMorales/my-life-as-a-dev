/**
 * Manages the particle animation system
 */
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
    this.count = isMobile ? 30 : 80; // Reduced count on mobile
    
    // Initialize the particle system
    this.init();
  }
  
  /**
   * Update mobile status when screen size changes
   * @param {boolean} isMobile - New mobile status
   */
  updateMobileStatus(isMobile) {
    if (this.isMobile !== isMobile) {
      this.isMobile = isMobile;
      // Rebuild particles with new count if mobile status changed
      this.clear();
      this.init();
    }
  }
  
  /**
   * Initialize the particle system
   */
  init() {
    // Create particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: this.isDark ? 0xaaccff : 0x225588,
      size: this.isMobile ? 0.5 : 0.8,
      transparent: true,
      opacity: this.isMobile ? 0.6 : 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Generate random positions
    const positions = new Float32Array(this.count * 3);
    const velocities = [];
    
    for (let i = 0; i < this.count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 50;     // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
      
      // Velocity
      velocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.05
      });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create the particle system
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particleSystem);
    
    // Store velocities for animation
    this.velocities = velocities;
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
  }
  
  /**
   * Update theme colors
   * @param {boolean} isDark - Whether dark mode is enabled
   */
  updateTheme(isDark) {
    this.isDark = isDark;
    if (this.particleSystem) {
      this.particleSystem.material.color.set(isDark ? 0xaaccff : 0x225588);
    }
  }
  
  /**
   * Update particle positions for animation
   */
  update() {
    if (!this.particleSystem) return;
    
    const positions = this.particleSystem.geometry.attributes.position.array;
    
    // Use a lower frequency for updates on mobile
    const updateFrequency = this.isMobile ? 2 : 1;
    if (this.isMobile && Math.random() > 1/updateFrequency) return;
    
    // Update each particle position
    for (let i = 0; i < this.count; i++) {
      positions[i * 3] += this.velocities[i].x;
      positions[i * 3 + 1] += this.velocities[i].y;
      positions[i * 3 + 2] += this.velocities[i].z;
      
      // Wrap around if out of bounds
      if (positions[i * 3] > 25) positions[i * 3] = -25;
      if (positions[i * 3] < -25) positions[i * 3] = 25;
      if (positions[i * 3 + 1] > 25) positions[i * 3 + 1] = -25;
      if (positions[i * 3 + 1] < -25) positions[i * 3 + 1] = 25;
      if (positions[i * 3 + 2] > 25) positions[i * 3 + 2] = -25;
      if (positions[i * 3 + 2] < -25) positions[i * 3 + 2] = 25;
    }
    
    // Mark the attribute as needing an update
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }
}

export default ParticleSystem;