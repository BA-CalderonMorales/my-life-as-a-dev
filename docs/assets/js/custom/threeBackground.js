"use strict";

document.addEventListener('DOMContentLoaded', async () => {
  const THREE = await import('three');

  const container = document.createElement('div');
  container.id = 'three-background';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  document.body.appendChild(container);

  const scene = new THREE.Scene();
  const colors = getThemeColors();
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 60);

  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Completely transparent background
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Fallout-inspired particle system
  const particleCount = 60;
  const particles = [];
  const maxConnectionDistance = 30;
  
  // Scroll progress tracking
  let scrollProgress = 0;
  let maxScroll = 0;

  // Create simple geometries with a hint of depth
  function createParticle(type) {
    switch(type) {
      case 'spirit':
        // Floating spirit orbs like soot sprites
        return new THREE.SphereGeometry(0.3, 8, 6);
      case 'leaf':
        // Slightly thickened plane for more presence
        return new THREE.BoxGeometry(0.8, 1.2, 0.1);
      case 'crystal':
        // Magical crystals
        return new THREE.OctahedronGeometry(0.4);
      case 'seed':
        // Dandelion-like seeds
        return new THREE.TetrahedronGeometry(0.2);
      default:
        return new THREE.SphereGeometry(0.3, 8, 6);
    }
  }

  // Simple color palette
  function getFalloutColors() {
    return {
      particles: '#33ff33',
      connections: '#33ff33'
    };
  }

  // Create particles
  const falloutColors = getFalloutColors();
  const particleTypes = ['spirit', 'leaf', 'crystal', 'seed'];

  for (let i = 0; i < particleCount; i++) {
    const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    const geometry = createParticle(type);

    const material = new THREE.MeshStandardMaterial({
      color: falloutColors.particles,
      metalness: 0.7,
      roughness: 0.2
    });
    
    const particle = new THREE.Mesh(geometry, material);
    
    // More organic, naturalistic positioning
    const spread = 80;
    const x = (Math.random() - 0.5) * spread;
    const y = (Math.random() - 0.5) * spread;
    const z = (Math.random() - 0.5) * 60;
    
    particle.position.set(x, y, z);
    
  // Gentle movement parameters
    particle.userData = {
      type: type,
      originalPosition: particle.position.clone(),
      baseSpeed: 0.0008 + Math.random() * 0.0012, // Gentle pace
      amplitude: 2 + Math.random() * 4, // Organic floating range
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      scrollInfluence: 0.4 + Math.random() * 0.6,
      rotationSpeed: (Math.random() - 0.5) * 0.02, // Gentle rotation
      pulsePhase: Math.random() * Math.PI * 2,
      windPhase: Math.random() * Math.PI * 2 // For leaf flutter
    };
    
    particles.push(particle);
    scene.add(particle);
  }

  // Connection system
  const connectionLines = [];
  const linePool = [];
  
  function createConnectionLine() {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ 
      transparent: true,
      opacity: 0,
      blending: THREE.NormalBlending
    });
    const line = new THREE.Line(geometry, material);
    return line;
  }

  // Pool of connection lines
  for (let i = 0; i < 80; i++) {
    linePool.push(createConnectionLine());
  }

  // Fallout style lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x88ff88, 0.4);
  directionalLight.position.set(30, 50, 30);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Dynamic scroll-influenced light for cinematic effect
  const scrollLight = new THREE.PointLight(0x33ff33, 0.5, 50);
  scrollLight.position.set(0, 0, 20);
  scene.add(scrollLight);

  // Update connection visibility
  function updateConnections() {
    connectionLines.forEach(line => {
      line.visible = false;
      line.material.opacity = 0;
    });
    
    let lineIndex = 0;
    const falloutColors = getFalloutColors();
    
    // Create fewer, more meaningful connections
    for (let i = 0; i < particles.length && lineIndex < linePool.length; i++) {
      for (let j = i + 1; j < particles.length && lineIndex < linePool.length; j++) {
        const distance = particles[i].position.distanceTo(particles[j].position);
        
        // Only connect spirits to other elements for magical feel
        const particle1Type = particles[i].userData.type;
        const particle2Type = particles[j].userData.type;
        
        if (distance < maxConnectionDistance && (particle1Type === 'spirit' || particle2Type === 'spirit')) {
          const line = linePool[lineIndex];
          const points = [particles[i].position, particles[j].position];
          line.geometry.setFromPoints(points);
          
          // Subtle magical connections
          const baseOpacity = Math.pow((maxConnectionDistance - distance) / maxConnectionDistance, 3);
          const scrollInfluence = 0.2 + scrollProgress * 0.4; // More subtle
          line.material.opacity = baseOpacity * scrollInfluence * 0.3; // Much more subtle
          line.material.color.setHex(parseInt(falloutColors.connections.replace('#', '0x'))); // Dynamic connection color
          line.visible = true;
          
          connectionLines[lineIndex] = line;
          if (!line.parent) scene.add(line);
          lineIndex++;
        }
      }
    }
  }

  // Scroll progress calculation with smooth experience
  let targetCameraZ = 60;
  let targetCameraY = 0;
  let targetLightY = 0;
  let targetLightIntensity = 0.5;

  function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    maxScroll = Math.max(maxScroll, docHeight);
    scrollProgress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;

    targetCameraZ = 60 - scrollProgress * 30;
    targetCameraY = scrollProgress * -15;
    targetLightY = -scrollProgress * 40;
    targetLightIntensity = 0.5 + scrollProgress * 0.6;
  }

  function updateTheme() {
    console.log('Updating Fallout theme');

    // Update particle colors to match new palette
    const falloutColors = getFalloutColors();
    
    particles.forEach(particle => {
      const type = particle.userData.type;
      let targetColor;
      
      switch(type) {
        case 'spirit':
          targetColor = new THREE.Color(falloutColors.particles);
          break;
        case 'leaf':
          targetColor = new THREE.Color(falloutColors.particles);
          break;
        case 'crystal':
          targetColor = new THREE.Color(falloutColors.particles);
          break;
        case 'seed':
          targetColor = new THREE.Color(falloutColors.particles);
          break;
        default:
          targetColor = new THREE.Color(falloutColors.particles);
      }
      
      particle.material.color.lerp(targetColor, 0.1);
      
      // Update emissive for spirits
      if (type === 'spirit') {
        particle.material.emissive.lerp(targetColor.clone().multiplyScalar(0.2), 0.1);
      }
    });
    
  console.log('Fallout theme update complete');
    updateOpacity();
  }

  const themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, { attributes: true });
  themeObserver.observe(document.body, { attributes: true });

  // Enhanced visibility tracking
  const introSection = document.querySelector('.intro-section');
  let defaultOpacity = parseFloat(getComputedStyle(container).opacity) || 0.8;
  let introVisible = true;

  function updateOpacity() {
    defaultOpacity = parseFloat(getComputedStyle(container).opacity) || 0.8;
    const targetOpacity = introVisible ? defaultOpacity : 0.3;
    const currentOpacity = parseFloat(container.style.opacity) || defaultOpacity;
    container.style.opacity = currentOpacity + (targetOpacity - currentOpacity) * 0.1;
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

  // Mouse interaction for professional touch
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  
  document.addEventListener('mousemove', (event) => {
    targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Responsive design
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Scroll event with throttling for performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      updateScrollProgress();
      scrollTimeout = null;
    }, 16); // ~60fps
  });

  // Professional animation loop with time-based calculations
  let time = 0;
  let lastTime = 0;
  
  function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    time += deltaTime * 0.001;

    // Smooth mouse influence
    mouseX += (targetMouseX - mouseX) * 0.08; // More responsive mouse tracking
    mouseY += (targetMouseY - mouseY) * 0.08;

    // Subtle camera sway based on mouse
    camera.position.x += (mouseX * 4 - camera.position.x) * 0.04; // More pronounced mouse effect
    camera.position.y += (mouseY * 4 - camera.position.y) * 0.04;

    // Lerp camera and light towards scroll-based targets
    camera.position.z += (targetCameraZ - camera.position.z) * 0.08;
    camera.position.y += (targetCameraY - camera.position.y) * 0.08;
    scrollLight.position.y += (targetLightY - scrollLight.position.y) * 0.08;
    scrollLight.intensity += (targetLightIntensity - scrollLight.intensity) * 0.08;

    if (!introVisible) {
      renderer.render(scene, camera);
      return;
    }

    // Particle animation
    particles.forEach((particle, index) => {
      const userData = particle.userData;
      const scrollInfluence = scrollProgress * userData.scrollInfluence;
      
      // Gentle floating motion
      const baseX = userData.originalPosition.x + 
        Math.sin(time * userData.baseSpeed + userData.phaseX) * userData.amplitude;
      const baseY = userData.originalPosition.y + 
        Math.cos(time * userData.baseSpeed + userData.phaseY) * userData.amplitude;
      const baseZ = userData.originalPosition.z + 
        Math.sin(time * userData.baseSpeed + userData.phaseZ) * userData.amplitude * 0.3;
      
      // Scroll-based transformations - more organic
      const scrollX = scrollInfluence * Math.sin(index * 0.05) * 4; // Gentler
      const scrollY = scrollInfluence * -20; // Upward drift
      const scrollZ = scrollInfluence * 8;
      
      particle.position.set(
        baseX + scrollX,
        baseY + scrollY,
        baseZ + scrollZ
      );
      
      // Type-specific animations
      if (userData.type === 'leaf') {
        // Leaves flutter gently
        particle.rotation.z += userData.rotationSpeed;
        particle.rotation.y = Math.sin(time * 2 + userData.windPhase) * 0.3;
      } else if (userData.type === 'spirit') {
        // Spirits glow and pulse
        const pulse = 1 + Math.sin(time * 4 + userData.pulsePhase) * 0.15;
        particle.scale.set(pulse, pulse, pulse);
        
        // Gentle breathing glow
        const glowIntensity = 0.1 + Math.sin(time * 3 + userData.pulsePhase) * 0.1;
        particle.material.emissive.multiplyScalar(1 + glowIntensity);
      } else if (userData.type === 'crystal') {
        // Crystals rotate slowly
        particle.rotation.x += userData.rotationSpeed * 0.5;
        particle.rotation.y += userData.rotationSpeed * 0.3;
      } else if (userData.type === 'seed') {
        // Seeds drift and spin
        particle.rotation.z += userData.rotationSpeed * 2;
        const drift = Math.sin(time * 1.5 + userData.windPhase) * 0.5;
        particle.position.x += drift;
      }
      
      // Gentle opacity changes
      particle.material.opacity = (0.6 + scrollProgress * 0.2) * (0.8 + Math.sin(time + userData.pulsePhase) * 0.2);
    });

    // Update connections with performance throttling
    if (Math.floor(time * 30) % 10 === 0) { // More frequent updates for dynamic effect
      updateConnections();
    }

    renderer.render(scene, camera);
  }
  
  // Initialize
  updateScrollProgress();
  animate(0);
});

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  let particleColor = style.getPropertyValue('--three-particle-color').trim();
  
  // Remove any quotes and clean up the color values
  particleColor = particleColor.replace(/['"]/g, '');
  
  console.log('Raw CSS Custom Properties:', {
    particle: particleColor || 'NOT FOUND'
  });
  
  // Provide fallbacks if CSS vars aren't found
  const finalParticle = particleColor || '#33ff33';
  
  console.log('Final colors being returned:', {
    particle: finalParticle
  });
  
  return {
    particle: finalParticle
  };
}
