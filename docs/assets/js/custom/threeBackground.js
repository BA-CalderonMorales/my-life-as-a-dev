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

  function updateTheme() {
    const c = getThemeColors();
    scene.background.set(c.background);
    planes.forEach(p => p.mesh.material.color.set(c.plane));
  }

  const observer = new MutationObserver(updateTheme);
  observer.observe(document.documentElement, { attributes: true });
  observer.observe(document.body, { attributes: true });

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
    planes.forEach(p => {
      p.theta += speed * p.speedMult;
      p.mesh.position.x = Math.cos(p.theta) * p.radius;
      p.mesh.position.z = Math.sin(p.theta) * p.radius;
      p.mesh.rotation.y = p.theta + Math.PI / 2;
    });
    renderer.render(scene, camera);
  }
  animate();
});

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    plane: style.getPropertyValue('--three-particle-color').trim() || '#ffffff',
    background: style.getPropertyValue('--three-bg-color').trim() || '#3d9970'
  };
}
