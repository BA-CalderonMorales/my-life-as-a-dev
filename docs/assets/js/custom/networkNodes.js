"use strict";

document.addEventListener('DOMContentLoaded', function() {
  // Create canvas for the paper airplane cylinder background
  const sphereCanvas = document.createElement('canvas');
  sphereCanvas.id = 'background-canvas';
  sphereCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;';
  document.body.appendChild(sphereCanvas);

  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');

  // Configuration object for easy tweaks
  const CONFIG = {
    // Number of paper airplanes rendered (fewer for clarity)
    planeCount: Math.min(Math.floor((window.innerWidth * window.innerHeight) / 2800), 125),
    baseSpeed: 0.002,
    scrollBoost: 0.0005,
    maxBoost: 0.01,
    cylinderRadius: 800, // twice the perspective depth
    cylinderHeight: 1600,
    radiusVariation: 150,
    fov: 400, // closer perspective
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

  // Generate planes with random cylindrical positions and varied altitude
  const planes = [];
  for (let i = 0; i < CONFIG.planeCount; i++) {
    planes.push({
      theta: Math.random() * Math.PI * 2,
      y: (Math.random() - 0.5) * CONFIG.cylinderHeight,
      radiusOffset: (Math.random() - 0.5) * CONFIG.radiusVariation,
      vertAmp: 20 + Math.random() * 60,
      vertSpeed: 0.2 + Math.random() * 0.6,
      oscPhase: Math.random() * Math.PI * 2,
      size: 30 + Math.random() * 70
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
    ctx.moveTo(0, -1.5); // nose
    ctx.lineTo(1, 0.5);
    ctx.lineTo(0, 0);
    ctx.lineTo(-1, 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0.5, 1);
    ctx.lineTo(-0.5, 1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function animate() {
    ctx.fillStyle = CONFIG.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const speed = CONFIG.baseSpeed + extraSpeed;

    for (const plane of planes) {
      plane.theta += speed;

      // Vertical oscillation for natural motion
      plane.y += Math.sin(plane.theta * plane.vertSpeed + plane.oscPhase) * plane.vertAmp * speed;

      // Wrap vertical position to keep within cylinder bounds
      if (plane.y > CONFIG.cylinderHeight / 2) plane.y -= CONFIG.cylinderHeight;
      if (plane.y < -CONFIG.cylinderHeight / 2) plane.y += CONFIG.cylinderHeight;

      const r = CONFIG.cylinderRadius + plane.radiusOffset;
      const x3d = Math.cos(plane.theta) * r;
      const y3d = plane.y;
      const z3d = Math.sin(plane.theta) * r;
      const scale = CONFIG.fov / (CONFIG.fov + z3d);
      if (scale <= 0) continue; // behind camera

      const x2d = x3d * scale + canvas.width / 2;
      const y2d = y3d * scale + canvas.height / 2;
      const planeSize = plane.size * scale;
      const rotation = plane.theta + Math.PI / 2;

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
