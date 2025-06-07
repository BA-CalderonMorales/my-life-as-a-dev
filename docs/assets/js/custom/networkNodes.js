"use strict";

document.addEventListener('DOMContentLoaded', function() {
  // Create canvas for the paper airplane vortex
  const vortexCanvas = document.createElement('canvas');
  vortexCanvas.id = 'background-canvas';
  vortexCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;';
  document.body.appendChild(vortexCanvas);

  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');

  // Configuration object for easy tweaks
  const CONFIG = {
    planeCount: Math.min(Math.floor(window.innerWidth / 25), 60),
    baseSpeed: 0.01,
    scrollBoost: 0.002,
    maxBoost: 0.03,
    fov: 400, // perspective depth
    colors: {
      plane: '#ffffff',
      background: 'transparent'
    }
  };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    const planeColor = styles.getPropertyValue('--md-accent-fg-color').trim();
    const backgroundColor = styles.getPropertyValue('--md-default-bg-color').trim();

    return {
      plane: planeColor || CONFIG.colors.plane,
      background: backgroundColor || CONFIG.colors.background
    };
  }

  CONFIG.colors = getThemeColors();

  // Update colors on theme change
  const observer = new MutationObserver(() => {
    CONFIG.colors = getThemeColors();
  });
  observer.observe(document.documentElement, { attributes: true });
  observer.observe(document.body, { attributes: true });

  // Generate planes with random positions
  const planes = [];
  for (let i = 0; i < CONFIG.planeCount; i++) {
    planes.push({
      angle: Math.random() * Math.PI * 2,
      radius: 150 + Math.random() * 250,
      y: (Math.random() - 0.5) * 400,
      size: 8 + Math.random() * 8
    });
  }

  let extraSpeed = 0;
  let lastScrollY = window.scrollY;

  function drawPlane(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(-3, 1);
    ctx.lineTo(-0.6, 0.6);
    ctx.lineTo(-1, 2);
    ctx.lineTo(0, 1.2);
    ctx.lineTo(1, 2);
    ctx.lineTo(0.6, 0.6);
    ctx.lineTo(3, 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.fillStyle = CONFIG.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const speed = CONFIG.baseSpeed + extraSpeed;
    for (const plane of planes) {
      plane.angle += speed;

      const x3d = Math.cos(plane.angle) * plane.radius;
      const z3d = Math.sin(plane.angle) * plane.radius;
      const scale = CONFIG.fov / (CONFIG.fov + z3d);
      if (scale <= 0) continue; // behind camera

      const x2d = x3d * scale + canvas.width / 2;
      const y2d = plane.y * scale + canvas.height / 2;
      const planeSize = plane.size * scale;
      const rotation = plane.angle + Math.PI / 2;

      ctx.fillStyle = CONFIG.colors.plane;
      drawPlane(x2d, y2d, planeSize / 10, rotation); // divide to map to drawPlane scale
    }

    extraSpeed *= 0.95; // decay scroll boost
    requestAnimationFrame(animate);
  }

  animate();

  // Slightly increase speed when scrolling down
  window.addEventListener('scroll', () => {
    const newY = window.scrollY || window.pageYOffset;
    if (newY > lastScrollY) {
      extraSpeed = Math.min(extraSpeed + CONFIG.scrollBoost, CONFIG.maxBoost);
    }
    lastScrollY = newY;
  });

  // Export config for external customization
  window.BackgroundConfig = CONFIG;
});
