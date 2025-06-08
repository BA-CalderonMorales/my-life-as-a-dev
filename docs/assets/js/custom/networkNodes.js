"use strict";

document.addEventListener('DOMContentLoaded', function() {
  // Create canvas for the cloud sphere background
  const sphereCanvas = document.createElement('canvas');
  sphereCanvas.id = 'background-canvas';
  sphereCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;';
  document.body.appendChild(sphereCanvas);

  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');

  // Configuration object for easy tweaks
  const CONFIG = {
    // Number of clouds rendered in the sphere
    planeCount: Math.min(Math.floor((window.innerWidth * window.innerHeight) / 500), 600),
    baseSpeed: 0.01,
    scrollBoost: 0.0005,
    maxBoost: 0.015,
    sphereRadius: 300,
    fov: 250, // perspective depth
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
    const rootStyles = getComputedStyle(document.documentElement);
    const bodyStyles = getComputedStyle(document.body);
    const planeColor = (rootStyles.getPropertyValue('--md-accent-fg-color') ||
                        bodyStyles.getPropertyValue('--md-accent-fg-color')).trim();
    const backgroundColor = (
      rootStyles.getPropertyValue('--three-bg-color') ||
      bodyStyles.getPropertyValue('--three-bg-color') ||
      rootStyles.getPropertyValue('--md-default-bg-color') ||
      bodyStyles.getPropertyValue('--md-default-bg-color')
    ).trim();

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

  // Generate clouds with random spherical positions
  const planes = [];
  for (let i = 0; i < CONFIG.planeCount; i++) {
    planes.push({
      theta: Math.random() * Math.PI * 2,
      phi: (Math.random() - 0.5) * Math.PI,
      size: 30 + Math.random() * 70
    });
  }

  let extraSpeed = 0;
  let lastScrollY = window.scrollY;

  function drawCloud(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size, size);
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(-0.3, 0, 0.35, 0, Math.PI * 2);
    ctx.arc(0.1, -0.2, 0.45, 0, Math.PI * 2);
    ctx.arc(0.5, 0.1, 0.3, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(-0.1, 0.3, 0.1, 0, Math.PI * 2);
    ctx.arc(0.4, 0.4, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function animate() {
    ctx.fillStyle = CONFIG.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const speed = CONFIG.baseSpeed + extraSpeed;
    for (const plane of planes) {
      plane.theta += speed;

      const r = CONFIG.sphereRadius;
      const x3d = Math.cos(plane.theta) * Math.cos(plane.phi) * r;
      const y3d = Math.sin(plane.phi) * r;
      const z3d = Math.sin(plane.theta) * Math.cos(plane.phi) * r;
      const scale = CONFIG.fov / (CONFIG.fov + z3d);
      if (scale <= 0) continue; // behind camera

      const x2d = x3d * scale + canvas.width / 2;
      const y2d = y3d * scale + canvas.height / 2;
      const planeSize = plane.size * scale;
      const rotation = plane.theta + Math.PI / 2;

      ctx.fillStyle = CONFIG.colors.plane;
      drawCloud(x2d, y2d, planeSize / 10, rotation); // divide to map to drawCloud scale
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
