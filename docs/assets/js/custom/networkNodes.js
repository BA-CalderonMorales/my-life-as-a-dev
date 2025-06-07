"use strict";

document.addEventListener('DOMContentLoaded', function() {
  // Create the canvas element for the background animation
  const networkCanvas = document.createElement('canvas');
  networkCanvas.id = 'background-canvas';
  networkCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;';
  document.body.appendChild(networkCanvas);
  
  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');
  
  // Configuration - easy to customize
  const CONFIG = {
    // Node appearance - change these to customize the look
    nodeShape: 'circle', // 'circle', 'airplane', 'star', 'planet'
    nodeCount: Math.min(Math.floor(window.innerWidth / 30), 50),
    nodeSize: { min: 1, max: 3 },
    connectionDistance: Math.min(window.innerWidth, window.innerHeight) * 0.15,
    
    // Animation
    speed: { min: 0.2, max: 0.8 },
    
    // Colors - will be overridden by theme detection
    colors: {
      node: 'rgba(144, 202, 249, 0.7)',
      connection: 'rgba(129, 199, 132, 0.25)',
      glow: 'rgba(144, 202, 249, 0.15)'
    }
  };
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Theme detection and color management
  function getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.getAttribute('data-md-color-scheme') === 'slate';
    
    // Try to get theme colors from CSS
    const primaryColor = styles.getPropertyValue('--md-primary-fg-color').trim();
    const accentColor = styles.getPropertyValue('--md-accent-fg-color').trim();
    
    if (primaryColor && accentColor) {
      return {
        node: primaryColor.replace('rgb', 'rgba').replace(')', ', 0.7)'),
        connection: accentColor.replace('rgb', 'rgba').replace(')', ', 0.25)'),
        glow: primaryColor.replace('rgb', 'rgba').replace(')', ', 0.15)')
      };
    }
    
    // Fallback colors based on theme
    return isDark ? {
      node: 'rgba(144, 202, 249, 0.7)',
      connection: 'rgba(129, 199, 132, 0.25)',
      glow: 'rgba(144, 202, 249, 0.15)'
    } : {
      node: 'rgba(96, 125, 139, 0.8)',
      connection: 'rgba(3, 169, 244, 0.2)',
      glow: 'rgba(96, 125, 139, 0.1)'
    };
  }
  
  CONFIG.colors = getThemeColors();
  
  // Watch for theme changes
  const observer = new MutationObserver(() => {
    CONFIG.colors = getThemeColors();
  });
  observer.observe(document.documentElement, { attributes: true });
  observer.observe(document.body, { attributes: true });
  
  // Node system
  const nodes = [];
  
  // Create nodes
  for (let i = 0; i < CONFIG.nodeCount; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * (CONFIG.nodeSize.max - CONFIG.nodeSize.min) + CONFIG.nodeSize.min,
      vx: (Math.random() - 0.5) * CONFIG.speed.max,
      vy: (Math.random() - 0.5) * CONFIG.speed.max,
      connections: []
    });
  }
  
  // Drawing functions for different shapes
  const drawShapes = {
    circle: (ctx, x, y, size) => {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    },
    
    airplane: (ctx, x, y, size) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 2, size / 2);
      ctx.beginPath();
      // Simple airplane shape
      ctx.moveTo(0, -4);
      ctx.lineTo(-6, 2);
      ctx.lineTo(-2, 2);
      ctx.lineTo(-3, 6);
      ctx.lineTo(-1, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(1, 6);
      ctx.lineTo(3, 6);
      ctx.lineTo(2, 2);
      ctx.lineTo(6, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    
    star: (ctx, x, y, size) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        if (i === 0) {
          ctx.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
        } else {
          ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
        }
        
        const innerAngle = angle + Math.PI / 5;
        ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    
    planet: (ctx, x, y, size) => {
      // Planet with ring
      ctx.save();
      ctx.translate(x, y);
      
      // Planet body
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Ring
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 1.8, size * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    }
  };
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update positions and find connections
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Update position
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      
      // Keep in bounds
      node.x = Math.max(0, Math.min(canvas.width, node.x));
      node.y = Math.max(0, Math.min(canvas.height, node.y));
      
      // Find connections
      node.connections = [];
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CONFIG.connectionDistance) {
          node.connections.push(j);
          
          // Draw connection
          const opacity = (1 - distance / CONFIG.connectionDistance) * 0.25;
          ctx.strokeStyle = CONFIG.colors.connection.replace('0.25', opacity);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }
    
    // Draw nodes
    for (const node of nodes) {
      // Draw glow for connected nodes
      if (node.connections.length > 0) {
        ctx.fillStyle = CONFIG.colors.glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw node
      ctx.fillStyle = node.connections.length > 2 ? CONFIG.colors.node : CONFIG.colors.connection;
      ctx.strokeStyle = CONFIG.colors.node;
      ctx.lineWidth = 1;
      
      const drawFunction = drawShapes[CONFIG.nodeShape] || drawShapes.circle;
      drawFunction(ctx, node.x, node.y, node.size);
    }
    
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
  
  // Add scroll interaction
  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollFactor = scrollY / 5000;
    
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].y += Math.sin(scrollFactor + i) * 0.5;
      nodes[i].x += Math.cos(scrollFactor + i) * 0.5;
    }
  });
  
  // Export config for easy customization
  window.BackgroundConfig = CONFIG;
});

// To customize the background, use:
// window.BackgroundConfig.nodeShape = 'airplane'; // or 'star', 'planet', 'circle'
// window.BackgroundConfig.nodeCount = 30;
// etc.
