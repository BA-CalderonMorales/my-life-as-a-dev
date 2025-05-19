/**
 * Landing Page Scene Component
 * 
 * An interactive ThreeJS background with dynamic content rendering for the landing page
 */

import * as THREE from 'three';

// Profile data to be displayed in the scene
const profileData = {
  name: "Brandon A. Calderon Morales",
  title: "Product-Minded Software Engineer | DevOps Transformation Specialist",
  location: "Omaha, Nebraska, United States",
  tagline: "I build resilient code with strategic vision.",
  roles: [
    "Product-Minded Software Engineer",
    "DevOps Transformation Specialist",
    "Aspiring Platform Engineer",
    "Legacy Code Modernizer",
    "Technical Mentor",
    "Full-Stack Software Engineer"
  ],
  skills: [
    "DevOps Transformation",
    "CI/CD Pipeline Optimization",
    "Legacy Code Modernization",
    "Technical Mentorship",
    "Process Standardization"
  ],
  socialLinks: [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/bcalderonmorales-cmoe" },
    { name: "GitHub", url: "https://github.com/BA-CalderonMorales" },
    { name: "Email", url: "mailto:brandon.ceemoe@gmail.com" },
    { name: "Portfolio", url: "https://brandon-calderon-morales-portfolio.dev" }
  ]
};

export class LandingPageScene extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Initialize properties
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.particles = [];
    this.mousePosition = { x: 0, y: 0 };
    this.lastMouseMoveTime = 0;
    this.mouseActive = false;
    this.animationFrame = null;
    this.textElements = {};
    this.currentRoleIndex = 0;
    this.roleChangeInterval = null;
    
    // Set up the base HTML structure
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }
        
        .scene-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        .content-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          font-family: 'Roboto', sans-serif;
          pointer-events: none;
        }
        
        .name {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-shadow: 0 0 10px rgba(0, 136, 255, 0.5);
        }
        
        .role {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 5px rgba(0, 136, 255, 0.5);
          min-height: 2rem;
          text-align: center;
        }
        
        .location {
          font-size: 1rem;
          margin-bottom: 2rem;
          opacity: 0.8;
        }
        
        .tagline {
          font-size: 1.25rem;
          font-style: italic;
          margin-bottom: 2rem;
          text-shadow: 0 0 5px rgba(0, 136, 255, 0.3);
        }
        
        .social-links {
          display: flex;
          gap: 1rem;
          pointer-events: auto;
        }
        
        .social-link {
          background-color: rgba(0, 136, 255, 0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          backdrop-filter: blur(5px);
          transition: background-color 0.3s, transform 0.3s;
        }
        
        .social-link:hover {
          background-color: rgba(0, 136, 255, 0.4);
          transform: translateY(-2px);
        }
        
        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          animation: bounce 2s infinite;
          color: white;
          pointer-events: auto;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          40% {
            transform: translateY(-20px) translateX(-50%);
          }
          60% {
            transform: translateY(-10px) translateX(-50%);
          }
        }
        
        .scroll-arrow {
          width: 30px;
          height: 30px;
          margin-bottom: 0.5rem;
        }
        
        .scroll-text {
          font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
          .name {
            font-size: 2rem;
          }
          
          .role {
            font-size: 1.2rem;
          }
        }
      </style>
      
      <canvas class="scene-canvas"></canvas>
      
      <div class="content-container">
        <h1 class="name">${profileData.name}</h1>
        <div class="role" id="role-text"></div>
        <div class="location">${profileData.location}</div>
        <div class="tagline">🚀 ${profileData.tagline} 🛠</div>
        
        <div class="social-links">
          ${profileData.socialLinks.map(link => 
            `<a href="${link.url}" class="social-link" target="_blank">${link.name}</a>`
          ).join('')}
        </div>
      </div>
      
      <div class="scroll-indicator" id="scroll-indicator">
        <svg class="scroll-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
        </svg>
        <span class="scroll-text">Scroll down</span>
      </div>
    `;
  }
  
  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    this.initThreeJS();
    this.setupEventListeners();
    this.startRoleAnimation();
  }
  
  /**
   * Called when the element is removed from the DOM
   */
  disconnectedCallback() {
    this.stopRoleAnimation();
    this.cleanupEventListeners();
    this.stopAnimation();
    
    // Dispose of Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
  
  /**
   * Initialize Three.js scene
   */
  initThreeJS() {
    const canvas = this.shadowRoot.querySelector('.scene-canvas');
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);
    
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
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create particle system
    this.createParticles();
    
    // Start animation loop
    this.animate();
  }
  
  /**
   * Create particle system
   */
  createParticles() {
    // Particle count based on screen size
    const particleCount = window.innerWidth > 768 ? 100 : 60;
    
    // Particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Create particles with random positions
    for (let i = 0; i < particleCount; i++) {
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
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Particle material
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x0088ff,
      size: window.innerWidth > 768 ? 0.15 : 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Create points mesh
    this.particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particlePoints);
    
    // Create line group for connections
    this.lineGroup = new THREE.Group();
    this.scene.add(this.lineGroup);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Resize handler
    this.resizeHandler = this.handleResize.bind(this);
    window.addEventListener('resize', this.resizeHandler);
    
    // Mouse interaction
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    document.addEventListener('mousemove', this.mouseMoveHandler);
    
    // Scroll indicator click
    const scrollIndicator = this.shadowRoot.querySelector('#scroll-indicator');
    this.scrollClickHandler = this.handleScrollClick.bind(this);
    scrollIndicator.addEventListener('click', this.scrollClickHandler);
  }
  
  /**
   * Clean up event listeners
   */
  cleanupEventListeners() {
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    
    const scrollIndicator = this.shadowRoot.querySelector('#scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.removeEventListener('click', this.scrollClickHandler);
    }
  }
  
  /**
   * Start cycling through roles
   */
  startRoleAnimation() {
    const roleElement = this.shadowRoot.querySelector('#role-text');
    roleElement.textContent = profileData.roles[0];
    
    this.roleChangeInterval = setInterval(() => {
      this.currentRoleIndex = (this.currentRoleIndex + 1) % profileData.roles.length;
      
      // Fade out
      roleElement.style.opacity = 0;
      roleElement.style.transform = 'translateY(10px)';
      roleElement.style.transition = 'opacity 0.5s, transform 0.5s';
      
      // After fade out, change text and fade in
      setTimeout(() => {
        roleElement.textContent = profileData.roles[this.currentRoleIndex];
        roleElement.style.opacity = 1;
        roleElement.style.transform = 'translateY(0)';
      }, 500);
    }, 3000);
  }
  
  /**
   * Stop role animation
   */
  stopRoleAnimation() {
    if (this.roleChangeInterval) {
      clearInterval(this.roleChangeInterval);
      this.roleChangeInterval = null;
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.camera || !this.renderer) return;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * Handle mouse movement
   */
  handleMouseMove(event) {
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.lastMouseMoveTime = Date.now();
    this.mouseActive = true;
  }
  
  /**
   * Handle scroll indicator click
   */
  handleScrollClick() {
    const introSection = document.getElementById('intro');
    if (introSection) {
      introSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  /**
   * Update particle positions
   */
  updateParticles() {
    if (!this.particlePoints) return;
    
    const positionArray = this.particlePoints.geometry.attributes.position.array;
    
    // Update each particle
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Apply velocity
      particle.position.add(particle.velocity);
      
      // Bounce off boundaries
      if (Math.abs(particle.position.x) > 10) {
        particle.velocity.x *= -1;
      }
      if (Math.abs(particle.position.y) > 10) {
        particle.velocity.y *= -1;
      }
      if (Math.abs(particle.position.z) > 10) {
        particle.velocity.z *= -1;
      }
      
      // Apply mouse influence
      if (this.mouseActive && Date.now() - this.lastMouseMoveTime < 2000) {
        const mouseVector = new THREE.Vector3(
          this.mousePosition.x * 10,
          this.mousePosition.y * 10,
          0
        );
        
        const direction = new THREE.Vector3().subVectors(mouseVector, particle.position);
        const distance = direction.length();
        
        if (distance > 0.1) {
          direction.normalize();
          const factor = i % 2 === 0 ? 1 : -1;
          const strength = 0.0003;
          direction.multiplyScalar((strength * factor) / Math.max(0.1, distance * 0.1));
          particle.velocity.add(direction);
        }
      }
      
      // Update position in geometry buffer
      positionArray[i * 3] = particle.position.x;
      positionArray[i * 3 + 1] = particle.position.y;
      positionArray[i * 3 + 2] = particle.position.z;
    }
    
    // Flag geometry for update
    this.particlePoints.geometry.attributes.position.needsUpdate = true;
  }
  
  /**
   * Update connections between particles
   */
  updateConnections() {
    if (!this.lineGroup) return;
    
    // Only update connections every few frames for performance
    if (Math.random() > 0.2) return;
    
    // Remove existing lines
    while (this.lineGroup.children.length > 0) {
      this.lineGroup.remove(this.lineGroup.children[0]);
    }
    
    // Maximum connections per particle
    const maxConnections = window.innerWidth > 768 ? 3 : 2;
    
    // Track connected pairs to avoid duplicates
    const connectedPairs = new Map();
    
    // Check for particles in proximity
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
        
        // Connect if close enough and below max connections
        if (distance < 3 && connectionsCount < maxConnections) {
          // Create line geometry
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            particle1.position,
            particle2.position
          ]);
          
          // Line material with opacity based on distance
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x0066cc,
            transparent: true,
            opacity: Math.min(0.5, 1 - (distance / 3))
          });
          
          // Create line and add to scene
          const line = new THREE.Line(lineGeometry, lineMaterial);
          this.lineGroup.add(line);
          
          // Mark as connected
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
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    
    // Update particles
    this.updateParticles();
    
    // Update connections
    this.updateConnections();
    
    // Gentle rotation
    if (this.particlePoints) {
      this.particlePoints.rotation.y += 0.001;
    }
    if (this.lineGroup) {
      this.lineGroup.rotation.y += 0.001;
    }
    
    // Render
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * Stop animation
   */
  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

// Register custom element
customElements.define('landing-page-scene', LandingPageScene);
