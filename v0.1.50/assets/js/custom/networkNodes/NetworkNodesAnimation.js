/**
 * NetworkNodesAnimation
 * 
 * This class creates an interactive network animation with nodes and connections
 * that responds to user scroll and adapts to theme changes.
 */

export class NetworkNodesAnimation {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.nodes = [];
    this.nodeCount = 0;
    this.colors = null;
    this.connectionDistance = 0;
    this.observer = null;
  }

  /**
   * Initialize the network animation
   */
  initialize() {
    this.createCanvas();
    this.setupCanvas();
    this.setupThemeWatcher();
    this.createNodes();
    this.startAnimation();
    this.setupScrollInteraction();
  }

  /**
   * Create the canvas element for the animation
   */
  createCanvas() {
    const networkCanvas = document.createElement('canvas');
    networkCanvas.id = 'network-nodes';
    networkCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; pointer-events: none;';
    document.body.appendChild(networkCanvas);
    
    this.canvas = networkCanvas;
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Set up the canvas size and resize handling
   */
  setupCanvas() {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      // Recalculate responsive values when window size changes
      this.nodeCount = Math.min(Math.floor(window.innerWidth / 30), 50);
      this.connectionDistance = Math.min(this.canvas.width, this.canvas.height) * 0.15;
      
      // Recreate nodes if needed
      if (this.nodes.length === 0 || this.nodes.length !== this.nodeCount) {
        this.createNodes();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  /**
   * Get colors based on current theme
   */
  getThemeColors() {
    const isDarkTheme = document.body.getAttribute('data-md-color-scheme') === 'slate';
    
    if (isDarkTheme) {
      return {
        nodeColor: 'rgba(100, 149, 237, 0.6)', // Cornflower blue for dark theme
        lineColor: 'rgba(100, 149, 237, 0.2)',  // Lighter blue for connections
        glowColor: 'rgba(100, 149, 237, 0.1)'   // Glow effect
      };
    } else {
      return {
        nodeColor: 'rgba(66, 133, 244, 0.6)',  // Google blue for light theme
        lineColor: 'rgba(66, 133, 244, 0.15)', // Lighter blue for connections
        glowColor: 'rgba(66, 133, 244, 0.05)'  // Glow effect
      };
    }
  }

  /**
   * Set up theme watcher to update colors when theme changes
   */
  setupThemeWatcher() {
    this.colors = this.getThemeColors();
    
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-md-color-scheme') {
          this.colors = this.getThemeColors();
        }
      });
    });
    
    this.observer.observe(document.body, { attributes: true });
  }

  /**
   * Create network nodes
   */
  createNodes() {
    this.nodes = [];
    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connected: []
      });
    }
  }

  /**
   * Animate the network nodes
   */
  startAnimation() {
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw connections
      this.ctx.strokeStyle = this.colors.lineColor;
      this.ctx.lineWidth = 0.5;
      this.ctx.beginPath();
      
      // Reset connections and draw new ones
      for (let i = 0; i < this.nodes.length; i++) {
        this.nodes[i].connected = [];
        for (let j = i + 1; j < this.nodes.length; j++) {
          const dx = this.nodes[i].x - this.nodes[j].x;
          const dy = this.nodes[i].y - this.nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.connectionDistance) {
            const opacity = 1 - (distance / this.connectionDistance);
            this.ctx.strokeStyle = this.colors.lineColor.replace('0.2', opacity * 0.2);
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
            this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
            this.ctx.stroke();
            
            this.nodes[i].connected.push(j);
            this.nodes[j].connected.push(i);
          }
        }
      }
      
      // Draw nodes
      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        
        // Update position
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
        
        // Draw glow for nodes with connections
        if (node.connected.length > 0) {
          this.ctx.beginPath();
          this.ctx.arc(node.x, node.y, node.radius * 5, 0, Math.PI * 2);
          this.ctx.fillStyle = this.colors.glowColor;
          this.ctx.fill();
        }
        
        // Draw node
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = node.connected.length > 2 ? this.colors.nodeColor : this.colors.lineColor;
        this.ctx.fill();
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  /**
   * Set up scroll interaction to affect node positions
   */
  setupScrollInteraction() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollFactor = scrollY / 5000;
      
      for (let i = 0; i < this.nodes.length; i++) {
        this.nodes[i].y += Math.sin(scrollFactor + i) * 0.5;
        this.nodes[i].x += Math.cos(scrollFactor + i) * 0.5;
      }
    });
  }
}
