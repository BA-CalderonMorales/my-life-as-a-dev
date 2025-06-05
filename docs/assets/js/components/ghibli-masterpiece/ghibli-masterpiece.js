"use strict";
// Ghibli Forest Spirits Component
class GhibliMasterpiece extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="ghibli-container">
        <canvas id="ghibli-canvas"></canvas>
        <div id="fps-counter">FPS: --</div>
      </div>
    `;

    // Initialize the canvas
    this.canvas = this.querySelector('#ghibli-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.fpsCounter = this.querySelector('#fps-counter');
    
    // Set canvas size
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Initialize spirits
    this.spirits = [];
    for (let i = 0; i < 50; i++) {
      this.createSpirit();
    }
    
    // Start animation loop
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = this.lastTime;
    this.animate(this.lastTime);
  }
  
  resize() {
    const container = this.querySelector('.ghibli-container');
    const rect = container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  createSpirit() {
    const spirit = {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 10 + 5,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      color: `hsla(${Math.random() * 60 + 100}, 80%, 70%, ${Math.random() * 0.5 + 0.3})`,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      pulseSpeed: Math.random() * 0.05 + 0.01,
      pulseAmount: Math.random() * 0.3 + 0.7,
      phase: Math.random() * Math.PI * 2
    };
    this.spirits.push(spirit);
    return spirit;
  }
  
  updateSpirits(deltaTime) {
    this.spirits.forEach(spirit => {
      // Update position
      spirit.x += spirit.speedX * deltaTime * 0.05;
      spirit.y += spirit.speedY * deltaTime * 0.05;
      
      // Bounce off edges
      if (spirit.x < 0 || spirit.x > this.width) {
        spirit.speedX *= -1;
        spirit.x = Math.max(0, Math.min(this.width, spirit.x));
      }
      if (spirit.y < 0 || spirit.y > this.height) {
        spirit.speedY *= -1;
        spirit.y = Math.max(0, Math.min(this.height, spirit.y));
      }
      
      // Update rotation
      spirit.rotation += spirit.rotationSpeed * deltaTime * 0.05;
      
      // Update pulse
      spirit.phase += spirit.pulseSpeed * deltaTime * 0.05;
    });
  }
  
  drawSpirits() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw forest backdrop
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#1a472a');  // Deep forest green
    gradient.addColorStop(1, '#2d5a3a');  // Lighter forest green
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw some simple trees in the background
    this.drawTrees();
    
    // Draw spirits
    this.spirits.forEach(spirit => {
      this.ctx.save();
      
      // Apply pulsing effect
      const pulseFactor = 1 + Math.sin(spirit.phase) * spirit.pulseAmount * 0.2;
      const size = spirit.size * pulseFactor;
      
      this.ctx.translate(spirit.x, spirit.y);
      this.ctx.rotate(spirit.rotation);
      
      // Draw the spirit body (kodama-like)
      this.ctx.fillStyle = spirit.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw the spirit face
      const eyeSize = size * 0.15;
      const mouthSize = size * 0.1;
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      
      // Eyes
      this.ctx.beginPath();
      this.ctx.arc(-size/3, -size/4, eyeSize, 0, Math.PI * 2);
      this.ctx.arc(size/3, -size/4, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Mouth
      this.ctx.beginPath();
      this.ctx.arc(0, size/3, mouthSize, 0, Math.PI);
      this.ctx.fill();
      
      // Glow effect
      const glow = this.ctx.createRadialGradient(0, 0, size, 0, 0, size * 2);
      glow.addColorStop(0, spirit.color);
      glow.addColorStop(1, 'transparent');
      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }
  
  drawTrees() {
    // Draw some simple tree silhouettes in the background
    const treeCount = 15;
    this.ctx.fillStyle = '#0f2418';  // Dark forest silhouette
    
    for (let i = 0; i < treeCount; i++) {
      const x = (this.width / (treeCount - 1)) * i;
      const height = this.height * (0.3 + Math.sin(i * 0.5) * 0.1);
      const width = this.width * 0.05;
      
      // Tree trunk
      this.ctx.fillRect(x - width/6, this.height - height, width/3, height);
      
      // Tree canopy
      this.ctx.beginPath();
      this.ctx.moveTo(x - width/2, this.height - height * 0.6);
      this.ctx.lineTo(x, this.height - height * 1.1);
      this.ctx.lineTo(x + width/2, this.height - height * 0.6);
      this.ctx.fill();
      
      this.ctx.beginPath();
      this.ctx.moveTo(x - width/2, this.height - height * 0.8);
      this.ctx.lineTo(x, this.height - height * 1.3);
      this.ctx.lineTo(x + width/2, this.height - height * 0.8);
      this.ctx.fill();
    }
  }
  
  animate(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Update FPS counter
    this.frameCount++;
    if (timestamp - this.lastFpsUpdate >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
      this.fpsCounter.textContent = `FPS: ${fps}`;
      this.lastFpsUpdate = timestamp;
      this.frameCount = 0;
    }
    
    // Update and render
    this.updateSpirits(deltaTime);
    this.drawSpirits();
    
    // Continue animation loop
    requestAnimationFrame(time => this.animate(time));
  }
}

// Register the custom element
customElements.define('ghibli-masterpiece', GhibliMasterpiece);

// Export the component
export default GhibliMasterpiece;
