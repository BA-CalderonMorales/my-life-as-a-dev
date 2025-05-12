
document.addEventListener('DOMContentLoaded', function() {
  // Only run on landing page
  if (!document.body.classList.contains('landing-page')) {
    return;
  }
  
  // Create the canvas element for the network animation
  const networkCanvas = document.createElement('canvas');
  networkCanvas.id = 'network-nodes';
  networkCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; pointer-events: none;';
  document.body.appendChild(networkCanvas);
  
  const canvas = document.getElementById('network-nodes');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match window
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Node properties
  const nodes = [];
  const nodeCount = Math.min(Math.floor(window.innerWidth / 30), 50); // Responsive node count
  
  // Colors based on theme
  function getThemeColors() {
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
  
  let colors = getThemeColors();
  
  // Watch for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-md-color-scheme') {
        colors = getThemeColors();
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
  
  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      connected: []
    });
  }
  
  // Connection distance
  const connectionDistance = Math.min(canvas.width, canvas.height) * 0.15;
  
  // Animation
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    ctx.strokeStyle = colors.lineColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].connected = [];
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < connectionDistance) {
          const opacity = 1 - (distance / connectionDistance);
          ctx.strokeStyle = colors.lineColor.replace('0.2', opacity * 0.2);
          
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
          
          nodes[i].connected.push(j);
          nodes[j].connected.push(i);
        }
      }
    }
    
    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Update position
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      
      // Draw glow for nodes with connections
      if (node.connected.length > 0) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = colors.glowColor;
        ctx.fill();
      }
      
      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.connected.length > 2 ? colors.nodeColor : colors.lineColor;
      ctx.fill();
    }
    
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
  
  // Add scroll interaction - move nodes slightly based on scroll
  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollFactor = scrollY / 5000;
    
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].y += Math.sin(scrollFactor + i) * 0.5;
      nodes[i].x += Math.cos(scrollFactor + i) * 0.5;
    }
  });
});
