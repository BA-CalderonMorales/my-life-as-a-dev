"use strict";

document.addEventListener('DOMContentLoaded', function() {
  // Create canvas for the paper airplane sphere background
  const sphereCanvas = document.createElement('canvas');
  sphereCanvas.id = 'background-canvas';
  sphereCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;';
  document.body.appendChild(sphereCanvas);

  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');

  // Configuration object for easy tweaks
  const CONFIG = {
    // Number of paper airplanes rendered in the sphere (reduced for performance)
    planeCount: Math.min(Math.floor((window.innerWidth * window.innerHeight) / 1400), 250),
    baseSpeed: 0.003, // more stagnation
    scrollBoost: 0.0005,
    maxBoost: 0.01,
    sphereRadius: 300,
    radiusVariation: 120, // different altitude levels
    fov: 400, // closer perspective
    blackHoleRadius: 0.5, // radians of influence around the poles
    blackHoleStrength: 0.02,
    blackHoleSwirl: 0.15, // rotational pull
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
    const scheme = document.documentElement.getAttribute('data-md-color-scheme');
    if (scheme === 'default') {
      return { plane: '#ffffff', background: '#3d9970' }; // green background
    }
    return { plane: '#000000', background: '#ff7e5e' }; // sunset background
  }

  CONFIG.colors = getThemeColors();

  // Update colors on theme change
  const observer = new MutationObserver(() => {
    CONFIG.colors = getThemeColors();
  });
  observer.observe(document.documentElement, { attributes: true });
  observer.observe(document.body, { attributes: true });

  // Generate planes with random spherical positions and varied altitude
  const planes = [];
  for (let i = 0; i < CONFIG.planeCount; i++) {
    planes.push({
      theta: Math.random() * Math.PI * 2,
      phi: (Math.random() - 0.5) * Math.PI,
      radiusOffset: (Math.random() - 0.5) * CONFIG.radiusVariation,
      oscAmp: 0.1 + Math.random() * 0.3,
      oscSpeed: 0.2 + Math.random() * 0.6,
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

    // Apply wormhole-like pull and swirl at each pole

    for (const plane of planes) {
      plane.theta += speed;

      // Oscillate altitude slightly for natural motion
      const phiOsc = Math.sin(plane.theta * plane.oscSpeed + plane.oscPhase) * plane.oscAmp;
      plane.phi += phiOsc * speed;

      // Apply gravitational pull and rotational swirl towards each pole
      const distNorth = Math.abs(plane.phi + Math.PI / 2);
      const distSouth = Math.abs(plane.phi - Math.PI / 2);
      if (distNorth < CONFIG.blackHoleRadius) {
        plane.phi -= CONFIG.blackHoleStrength / (distNorth + 0.01);
        plane.theta += CONFIG.blackHoleSwirl * (CONFIG.blackHoleRadius - distNorth);
      }
      if (distSouth < CONFIG.blackHoleRadius) {
        plane.phi += CONFIG.blackHoleStrength / (distSouth + 0.01);
        plane.theta += CONFIG.blackHoleSwirl * (CONFIG.blackHoleRadius - distSouth);
      }

      // Remove planes that have been pulled beyond view and spawn new ones
      if (plane.phi < -Math.PI / 2 - 0.2 || plane.phi > Math.PI / 2 + 0.2) {
        Object.assign(plane, {
          theta: Math.random() * Math.PI * 2,
          phi: (Math.random() - 0.5) * Math.PI,
          radiusOffset: (Math.random() - 0.5) * CONFIG.radiusVariation,
          oscAmp: 0.1 + Math.random() * 0.3,
          oscSpeed: 0.2 + Math.random() * 0.6,
          oscPhase: Math.random() * Math.PI * 2,
          size: 30 + Math.random() * 70
        });
      }

      const r = CONFIG.sphereRadius + plane.radiusOffset;
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
