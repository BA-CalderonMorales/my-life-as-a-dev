/**
 * Canvas Scene - Crystal Cave Experience
 * Inspired by the Giant Crystal Cave of Naica - an immersive discovery
 */

(function () {
    'use strict';

    // Scene state
    let sceneState = null;

    // Theme definitions - Cave crystal aesthetic
    const themes = {
        dark: {
            background: 0x030308,       // Deep cave darkness
            fogColor: 0x0a0a15,         // Mysterious blue-black fog
            fogNear: 3,
            fogFar: 18,
            crystalColors: [
                0xb8e8ff,               // Ice blue
                0xe0f0ff,               // Pale crystal
                0x9dd5ff,               // Sky crystal
                0xffffff,               // Pure white
                0xd4f1ff,               // Frost
            ],
            particleColor: 0xaaddff,
            ambientColor: 0x1a2a40,
            ambientIntensity: 0.08,
            // Prismatic lights that slowly shift
            lights: [
                { color: 0x00ffff, intensity: 2.5, pos: [8, 6, 4] },      // Cyan
                { color: 0xff00ff, intensity: 1.8, pos: [-7, 4, 3] },     // Magenta
                { color: 0x4080ff, intensity: 2.0, pos: [0, -5, 6] },     // Blue
                { color: 0x00ff88, intensity: 1.5, pos: [-4, 8, -2] },    // Teal
                { color: 0xffffff, intensity: 3.0, pos: [0, 10, 0] },     // White key
            ]
        },
        light: {
            background: 0xf0f4f8,       // Soft daylight
            fogColor: 0xe8ecf0,
            fogNear: 5,
            fogFar: 25,
            crystalColors: [
                0x1a1a1a,               // Obsidian
                0x2a2a2a,               // Dark gray
                0x0a0a0a,               // Near black
                0x3a3a3a,               // Charcoal
                0x151515,               // Deep black
            ],
            particleColor: 0x333333,
            ambientColor: 0xffffff,
            ambientIntensity: 0.5,
            lights: [
                { color: 0xffffff, intensity: 1.5, pos: [8, 6, 4] },
                { color: 0xeeeeee, intensity: 1.2, pos: [-7, 4, 3] },
                { color: 0xffffff, intensity: 1.0, pos: [0, -5, 6] },
                { color: 0xdddddd, intensity: 0.8, pos: [-4, 8, -2] },
                { color: 0xffffff, intensity: 2.0, pos: [0, 10, 0] },
            ]
        }
    };

    function getTheme() {
        const scheme = document.body.getAttribute('data-md-color-scheme');
        return scheme === 'slate' ? 'dark' : 'light';
    }

    function getThemeColors() {
        return themes[getTheme()];
    }

    function isCanvasPage() {
        return window.location.pathname.includes('/canvas/');
    }

    function cleanup() {
        if (!sceneState) return;

        const {
            animationId, container, renderer,
            crystals, materials, particles, particleGeometry, particleMaterial,
            themeObserver, handleResize, positionCanvas
        } = sceneState;

        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
        window.removeEventListener('resize', positionCanvas);
        window.removeEventListener('scroll', positionCanvas);

        if (themeObserver) {
            themeObserver.disconnect();
        }

        if (renderer) {
            renderer.dispose();
        }

        // Dispose crystal geometries and materials
        if (crystals) {
            crystals.forEach(crystal => {
                if (crystal.geometry) crystal.geometry.dispose();
            });
        }
        if (materials) {
            materials.forEach(mat => mat.dispose());
        }

        // Dispose particles
        if (particleGeometry) particleGeometry.dispose();
        if (particleMaterial) particleMaterial.dispose();

        // Remove container from DOM
        if (container && container.parentElement) {
            container.parentElement.removeChild(container);
        }

        sceneState = null;
    }

    async function initScene() {
        // Don't initialize if not on canvas page
        if (!isCanvasPage()) return;

        // Don't double-initialize
        if (sceneState) return;

        // Create container
        const container = document.createElement('div');
        container.id = 'canvas-scene';
        container.style.cssText = 'position: fixed; left: 0; width: 100vw; z-index: 1; pointer-events: auto;';
        document.body.appendChild(container);

        // Position canvas between header and footer
        function positionCanvas() {
            const header = document.querySelector('.md-header');
            const footer = document.querySelector('.md-footer');

            const headerHeight = header ? header.offsetHeight : 0;

            let footerTop = window.innerHeight;
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < window.innerHeight && footerRect.top > headerHeight) {
                    footerTop = footerRect.top;
                }
            }

            const canvasHeight = footerTop - headerHeight;

            container.style.top = headerHeight + 'px';
            container.style.height = canvasHeight + 'px';
        }

        positionCanvas();
        window.addEventListener('resize', positionCanvas);
        window.addEventListener('scroll', positionCanvas);

        // Load Three.js dynamically
        try {
            const THREE = await import('three');
            const {
                Scene, PerspectiveCamera, WebGLRenderer,
                OctahedronGeometry, CylinderGeometry, MeshPhysicalMaterial, Mesh, Group,
                AmbientLight, PointLight, Color, Fog,
                BufferGeometry, Float32BufferAttribute, PointsMaterial, Points,
                Vector3
            } = THREE;

            // Check again in case we navigated away during import
            if (!isCanvasPage()) {
                if (container.parentElement) {
                    container.parentElement.removeChild(container);
                }
                return;
            }

            const colors = getThemeColors();

            // Scene setup with fog for depth
            const scene = new Scene();
            scene.background = new Color(colors.background);
            scene.fog = new Fog(colors.fogColor, colors.fogNear, colors.fogFar);

            // Camera - wider FOV for immersion
            const camera = new PerspectiveCamera(
                65,
                container.clientWidth / container.clientHeight,
                0.1,
                1000
            );
            camera.position.set(0, 0, 8);

            // Renderer with better quality
            const renderer = new WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance'
            });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            container.appendChild(renderer.domElement);

            // Crystal group for collective animation
            const crystalGroup = new Group();
            scene.add(crystalGroup);

            // Create crystal geometry - elongated octahedron shape
            function createCrystalGeometry(height, radius) {
                const geo = new OctahedronGeometry(radius, 0);
                // Stretch vertically for crystal shape
                const positions = geo.attributes.position.array;
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] *= height / radius;
                }
                geo.attributes.position.needsUpdate = true;
                geo.computeVertexNormals();
                return geo;
            }

            // Crystal configurations - positions, sizes, rotations
            const crystalConfigs = [
                // Central dominant crystal
                { pos: [0, 0, 0], height: 2.5, radius: 0.6, rotX: 0.1, rotZ: 0.05 },
                // Surrounding crystals at various angles
                { pos: [-2.5, -1, 1], height: 3.2, radius: 0.5, rotX: 0.3, rotZ: -0.4 },
                { pos: [2.8, -0.5, 0.5], height: 2.8, radius: 0.45, rotX: -0.2, rotZ: 0.5 },
                { pos: [-1.5, 1.5, -1], height: 2.0, radius: 0.35, rotX: 0.4, rotZ: 0.3 },
                { pos: [1.8, 2, -0.5], height: 1.8, radius: 0.4, rotX: -0.35, rotZ: -0.2 },
                { pos: [0.5, -2.5, 1.5], height: 3.5, radius: 0.55, rotX: 0.15, rotZ: 0.1 },
                { pos: [-3, 0.5, -2], height: 2.2, radius: 0.3, rotX: -0.5, rotZ: 0.4 },
                { pos: [3.5, 0, -1.5], height: 1.5, radius: 0.25, rotX: 0.25, rotZ: -0.35 },
                // Background crystals - larger, further away
                { pos: [-5, -3, -4], height: 5, radius: 0.8, rotX: 0.2, rotZ: -0.3 },
                { pos: [6, 2, -5], height: 4.5, radius: 0.7, rotX: -0.4, rotZ: 0.2 },
                { pos: [0, -4, -6], height: 6, radius: 1, rotX: 0.1, rotZ: 0 },
                { pos: [-4, 4, -5], height: 4, radius: 0.6, rotX: 0.3, rotZ: 0.5 },
            ];

            const crystals = [];
            const materials = [];

            crystalConfigs.forEach((config, i) => {
                const colorIndex = i % colors.crystalColors.length;
                const material = new MeshPhysicalMaterial({
                    color: colors.crystalColors[colorIndex],
                    metalness: 0.0,
                    roughness: 0.05,
                    transmission: 0.92,         // Glass-like transparency
                    thickness: 1.5,             // Refraction depth
                    ior: 2.4,                   // Diamond-like refraction
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.05,
                    envMapIntensity: 1.5,
                    flatShading: true,
                });
                materials.push(material);

                const geometry = createCrystalGeometry(config.height, config.radius);
                const crystal = new Mesh(geometry, material);
                crystal.position.set(...config.pos);
                crystal.rotation.x = config.rotX;
                crystal.rotation.z = config.rotZ;

                // Store base rotation for animation
                crystal.userData = {
                    baseRotX: config.rotX,
                    baseRotZ: config.rotZ,
                    animOffset: Math.random() * Math.PI * 2,
                    animSpeed: 0.3 + Math.random() * 0.4
                };

                crystalGroup.add(crystal);
                crystals.push(crystal);
            });

            // Floating particles - dust/minerals in the air
            const particleCount = 800;
            const particlePositions = new Float32Array(particleCount * 3);
            const particleVelocities = [];

            for (let i = 0; i < particleCount; i++) {
                particlePositions[i * 3] = (Math.random() - 0.5) * 25;
                particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
                particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
                particleVelocities.push({
                    x: (Math.random() - 0.5) * 0.002,
                    y: (Math.random() - 0.5) * 0.002 + 0.001,  // Slight upward drift
                    z: (Math.random() - 0.5) * 0.002
                });
            }

            const particleGeometry = new BufferGeometry();
            particleGeometry.setAttribute('position', new Float32BufferAttribute(particlePositions, 3));

            const particleMaterial = new PointsMaterial({
                color: colors.particleColor,
                size: 0.04,
                transparent: true,
                opacity: 0.6,
                sizeAttenuation: true
            });

            const particles = new Points(particleGeometry, particleMaterial);
            scene.add(particles);

            // Lighting setup
            const ambientLight = new AmbientLight(colors.ambientColor, colors.ambientIntensity);
            scene.add(ambientLight);

            const pointLights = [];
            colors.lights.forEach(lightConfig => {
                const light = new PointLight(lightConfig.color, lightConfig.intensity, 30);
                light.position.set(...lightConfig.pos);
                scene.add(light);
                pointLights.push(light);
            });

            // Mouse interaction for subtle parallax
            let mouseX = 0, mouseY = 0;
            let targetMouseX = 0, targetMouseY = 0;

            container.addEventListener('mousemove', (e) => {
                targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            });

            // Theme change handler
            function applyTheme() {
                const newColors = getThemeColors();
                const duration = 800;
                const startTime = performance.now();

                // Store current values
                const currentBg = scene.background.clone();
                const targetBg = new Color(newColors.background);
                const currentFog = scene.fog.color.clone();
                const targetFog = new Color(newColors.fogColor);
                const currentParticle = particleMaterial.color.clone();
                const targetParticle = new Color(newColors.particleColor);
                const currentAmbient = ambientLight.color.clone();
                const targetAmbient = new Color(newColors.ambientColor);
                const startAmbientIntensity = ambientLight.intensity;

                const crystalCurrentColors = materials.map(m => m.color.clone());
                const crystalTargetColors = materials.map((m, i) =>
                    new Color(newColors.crystalColors[i % newColors.crystalColors.length])
                );

                const lightCurrentColors = pointLights.map(l => l.color.clone());
                const lightTargetColors = newColors.lights.map(c => new Color(c.color));
                const lightStartIntensities = pointLights.map(l => l.intensity);

                function animateTheme(currentTime) {
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);

                    scene.background.lerpColors(currentBg, targetBg, eased);
                    scene.fog.color.lerpColors(currentFog, targetFog, eased);
                    scene.fog.near = colors.fogNear + (newColors.fogNear - colors.fogNear) * eased;
                    scene.fog.far = colors.fogFar + (newColors.fogFar - colors.fogFar) * eased;

                    particleMaterial.color.lerpColors(currentParticle, targetParticle, eased);
                    ambientLight.color.lerpColors(currentAmbient, targetAmbient, eased);
                    ambientLight.intensity = startAmbientIntensity +
                        (newColors.ambientIntensity - startAmbientIntensity) * eased;

                    materials.forEach((mat, i) => {
                        mat.color.lerpColors(crystalCurrentColors[i], crystalTargetColors[i], eased);
                    });

                    pointLights.forEach((light, i) => {
                        light.color.lerpColors(lightCurrentColors[i], lightTargetColors[i], eased);
                        light.intensity = lightStartIntensities[i] +
                            (newColors.lights[i].intensity - lightStartIntensities[i]) * eased;
                    });

                    if (progress < 1) {
                        requestAnimationFrame(animateTheme);
                    }
                }
                requestAnimationFrame(animateTheme);
            }

            // Watch for theme changes
            const themeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'data-md-color-scheme') {
                        applyTheme();
                    }
                });
            });
            themeObserver.observe(document.body, { attributes: true });

            // Animation loop
            let animationId;
            const clock = { start: performance.now() };

            function animate() {
                animationId = requestAnimationFrame(animate);

                const elapsed = (performance.now() - clock.start) / 1000;

                // Smooth mouse following
                mouseX += (targetMouseX - mouseX) * 0.02;
                mouseY += (targetMouseY - mouseY) * 0.02;

                // Gentle crystal group rotation with mouse parallax
                crystalGroup.rotation.y = elapsed * 0.05 + mouseX * 0.3;
                crystalGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.1 + mouseY * 0.15;

                // Individual crystal breathing/pulsing
                crystals.forEach((crystal, i) => {
                    const { animOffset, animSpeed, baseRotX, baseRotZ } = crystal.userData;
                    const wave = Math.sin(elapsed * animSpeed + animOffset);

                    // Subtle rotation oscillation
                    crystal.rotation.x = baseRotX + wave * 0.02;
                    crystal.rotation.z = baseRotZ + Math.cos(elapsed * animSpeed * 0.7 + animOffset) * 0.015;

                    // Subtle scale pulse
                    const scale = 1 + wave * 0.02;
                    crystal.scale.setScalar(scale);
                });

                // Animate particles
                const positions = particles.geometry.attributes.position.array;
                for (let i = 0; i < particleCount; i++) {
                    positions[i * 3] += particleVelocities[i].x;
                    positions[i * 3 + 1] += particleVelocities[i].y;
                    positions[i * 3 + 2] += particleVelocities[i].z;

                    // Wrap around bounds
                    if (positions[i * 3] > 12.5) positions[i * 3] = -12.5;
                    if (positions[i * 3] < -12.5) positions[i * 3] = 12.5;
                    if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -10;
                    if (positions[i * 3 + 1] < -10) positions[i * 3 + 1] = 10;
                    if (positions[i * 3 + 2] > 10) positions[i * 3 + 2] = -10;
                    if (positions[i * 3 + 2] < -10) positions[i * 3 + 2] = 10;
                }
                particles.geometry.attributes.position.needsUpdate = true;

                // Subtle light movement for shimmer
                pointLights.forEach((light, i) => {
                    const basePos = colors.lights[i].pos;
                    light.position.x = basePos[0] + Math.sin(elapsed * 0.5 + i) * 0.5;
                    light.position.y = basePos[1] + Math.cos(elapsed * 0.3 + i * 2) * 0.3;
                });

                renderer.render(scene, camera);
            }
            animate();

            // Handle resize
            function handleResize() {
                positionCanvas();
                const width = container.clientWidth;
                const height = container.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleResize);

            // Store state for cleanup
            sceneState = {
                animationId,
                container,
                renderer,
                crystals,
                materials,
                particles,
                particleGeometry,
                particleMaterial,
                themeObserver,
                handleResize,
                positionCanvas
            };

        } catch (err) {
            console.error('Failed to load Three.js:', err);
            if (container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }
    }

    // Check on page load/navigation
    function checkPage() {
        if (isCanvasPage()) {
            if (!sceneState) {
                initScene();
            }
        } else {
            if (sceneState) {
                cleanup();
            }
        }
    }

    // Initial check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkPage);
    } else {
        checkPage();
    }

    // Track URL changes via polling (most reliable for instant navigation)
    let lastPathname = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== lastPathname) {
            lastPathname = window.location.pathname;
            checkPage();
        }
    }, 100);

    // Also handle popstate for back/forward
    window.addEventListener('popstate', () => {
        setTimeout(checkPage, 50);
    });

})();
