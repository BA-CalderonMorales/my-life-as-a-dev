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
  const cylinderRadius = Math.max(window.innerWidth, window.innerHeight);

  const planeGeometry = new THREE.PlaneGeometry(20, 10);
  const planeCount = Math.floor(Math.min(Math.floor((window.innerWidth * window.innerHeight) / 1400), 250) / 2);
  const planes = [];

  for (let i = 0; i < planeCount; i++) {
    const material = new THREE.MeshBasicMaterial({ color: colors.plane, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(planeGeometry, material);
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * cylinderHeight;
    mesh.position.set(Math.cos(theta) * cylinderRadius, y, Math.sin(theta) * cylinderRadius);
    mesh.rotation.y = theta + Math.PI / 2;
    planes.push({ mesh, theta });
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

  const speed = 0.002;
  function animate() {
    requestAnimationFrame(animate);
    planes.forEach(p => {
      p.theta += speed;
      p.mesh.position.x = Math.cos(p.theta) * cylinderRadius;
      p.mesh.position.z = Math.sin(p.theta) * cylinderRadius;
      p.mesh.rotation.y = p.theta + Math.PI / 2;
    });
    renderer.render(scene, camera);
  }
  animate();
});

function getThemeColors() {
  const scheme = document.documentElement.getAttribute('data-md-color-scheme');
  if (scheme === 'default') {
    return { plane: '#ffffff', background: '#3d9970' };
  }
  return { plane: '#000000', background: '#ff7e5e' };
}
