"use strict";

document.addEventListener('DOMContentLoaded', async () => {
  const THREE = await import('three');

  const container = document.createElement('div');
  container.id = 'three-background';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  document.body.appendChild(container);

  const scene = new THREE.Scene();
  const colors = getThemeColors();
  scene.background = new THREE.Color(colors.background);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = Math.max(window.innerWidth, window.innerHeight);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const cylinderHeight = window.innerHeight * 2;
  const baseRadius = Math.max(window.innerWidth, window.innerHeight);

  const geometryFactories = [
    () => new THREE.PlaneGeometry(20, 10),
    () => new THREE.BoxGeometry(12, 12, 12),
    () => new THREE.SphereGeometry(8, 12, 12)
  ];

  // -- Cosmic elements inspired by SVG demo --

  // Central sun with radial gradient
  function createSun() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'gold');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(12, 12, 1);
    return sprite;
  }

  const sun = createSun();
  scene.add(sun);

  // Orbiting planets
  const planetConfigs = [
    { distance: 15, size: 1, color: 0x808080, speed: 0.02, dir: 1 },
    { distance: 25, size: 2, color: 0xd2b48c, speed: 0.015, dir: -1 },
    { distance: 35, size: 2.2, color: 0x00bfff, speed: 0.012, dir: 1 },
    { distance: 45, size: 1.8, color: 0xffa500, speed: 0.009, dir: 1 },
    { distance: 60, size: 4, color: 0xcd853f, speed: 0.006, dir: -1 }
  ];
  const planets = planetConfigs.map(cfg => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(cfg.size, 12, 12),
      new THREE.MeshBasicMaterial({ color: cfg.color })
    );
    mesh.userData = { theta: Math.random() * Math.PI * 2, cfg };
    scene.add(mesh);
    return mesh;
  });

  // Moving objects (shooting star, rocket, alien)
  const movers = [];

  function randomEdgePosition() {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) return { x: -100, y: (Math.random() - 0.5) * 120 };
    if (side === 1) return { x: 100, y: (Math.random() - 0.5) * 120 };
    if (side === 2) return { x: (Math.random() - 0.5) * 120, y: -100 };
    return { x: (Math.random() - 0.5) * 120, y: 100 };
  }

  function createMover(size, color, duration) {
    const geo = new THREE.ConeGeometry(size, size * 2, 4);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    resetMover(mesh);
    mesh.userData.duration = duration;
    scene.add(mesh);
    movers.push(mesh);
  }

  function resetMover(mesh) {
    const start = randomEdgePosition();
    const end = randomEdgePosition();
    mesh.position.set(start.x, start.y, 0);
    mesh.userData = Object.assign(mesh.userData || {}, {
      start,
      end,
      startTime: performance.now()
    });
  }

  // Create initial movers
  createMover(1, 0xffffff, 10000); // shooting star
  setTimeout(() => createMover(1.5, 0xc0c0c0, 12000), 20000); // rocket after 20s
  setTimeout(() => createMover(1.6, 0x90ee90, 14000), 40000); // alien after 40s

  const planeCount = Math.floor(Math.min(Math.floor((window.innerWidth * window.innerHeight) / 1000), 300));
  const planes = [];

  for (let i = 0; i < planeCount; i++) {
    const geometry = geometryFactories[Math.floor(Math.random() * geometryFactories.length)]();
    const material = new THREE.MeshBasicMaterial({ color: colors.plane, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    const theta = Math.random() * Math.PI * 2;
    const radius = baseRadius * (0.6 + Math.random() * 0.6);
    const y = (Math.random() - 0.5) * cylinderHeight;
    const speedMult = 0.5 + Math.random();
    mesh.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
    mesh.rotation.set(Math.random() * Math.PI, theta + Math.PI / 2, Math.random() * Math.PI);
    planes.push({ mesh, theta, radius, speedMult });
    scene.add(mesh);
  }

  // Background stars with varied sizes and opacities
  const starLayers = [];
  function addStarLayer(count, size, opacity) {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size, transparent: true, opacity });
    const points = new THREE.Points(geom, mat);
    starLayers.push(points);
    scene.add(points);
  }

  addStarLayer(80, 0.4, 0.6);
  addStarLayer(100, 0.6, 0.8);
  addStarLayer(60, 0.8, 0.4);

  function updateTheme() {
    const c = getThemeColors();
    scene.background.set(c.background);
    planes.forEach(p => p.mesh.material.color.set(c.plane));
    updateOpacity();
  }

  const themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, { attributes: true });
  themeObserver.observe(document.body, { attributes: true });

  // Track visibility of the intro section to fade background
  const introSection = document.querySelector('.intro-section');
  let defaultOpacity = parseFloat(getComputedStyle(container).opacity) || 0.7;
  let introVisible = true;

  function updateOpacity() {
    defaultOpacity = parseFloat(getComputedStyle(container).opacity) || 0.7;
    container.style.opacity = introVisible ? defaultOpacity : 0;
  }

  if (introSection) {
    const visObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        introVisible = entry.isIntersecting;
      });
      updateOpacity();
    }, { threshold: 0.1 });
    visObserver.observe(introSection);
  }

  // Set initial opacity based on current theme
  updateOpacity();


  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const baseSpeed = 0.002;
  let scrollVelocity = 0;
  window.addEventListener('scroll', () => {
    scrollVelocity = window.scrollY * 0.000001;
  });

  function animate() {
    requestAnimationFrame(animate);
    const speed = baseSpeed + scrollVelocity;
    if (!introVisible) {
      renderer.render(scene, camera);
      return;
    }
    planes.forEach(p => {
      p.theta += speed * p.speedMult;
      p.mesh.position.x = Math.cos(p.theta) * p.radius;
      p.mesh.position.z = Math.sin(p.theta) * p.radius;
      p.mesh.rotation.y = p.theta + Math.PI / 2;
    });
    planets.forEach(planet => {
      const { cfg } = planet.userData;
      planet.userData.theta += cfg.speed * cfg.dir;
      planet.position.x = Math.cos(planet.userData.theta) * cfg.distance;
      planet.position.y = Math.sin(planet.userData.theta) * cfg.distance;
    });
    starLayers.forEach(layer => {
      layer.rotation.y += 0.0005;
    });
    const now = performance.now();
    movers.forEach(m => {
      const t = (now - m.userData.startTime) / m.userData.duration;
      if (t >= 1) {
        resetMover(m);
        return;
      }
      m.position.x = m.userData.start.x + (m.userData.end.x - m.userData.start.x) * t;
      m.position.y = m.userData.start.y + (m.userData.end.y - m.userData.start.y) * t;
    });
    renderer.render(scene, camera);
  }
  animate();
});

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const planeColor = style.getPropertyValue('--three-particle-color').trim();
  const bgColor = style.getPropertyValue('--three-bg-color').trim();
  
  console.log('CSS Custom Properties:', {
    plane: planeColor || 'NOT FOUND',
    background: bgColor || 'NOT FOUND'
  });
  
  return {
    plane: planeColor || '#ffffff',
    background: bgColor || '#3d9970'
  };
}
