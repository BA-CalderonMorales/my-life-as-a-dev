/**
 * Zen Geometry Scene
 *
 * Minimalist geometric visualization representing calm, precise systems.
 * Interconnected nodes with clean lines - like well-architected infrastructure.
 * Responsive design with touch/mouse interaction for an organic, alive feel.
 */
import * as THREE from 'three';

export class ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.clock = new THREE.Clock();

        // Scene elements
        this.nodes = [];
        this.connections = [];
        this.centralForm = null;
        this.particles = null;
        this.particlePositions = null;
        this.particleVelocities = [];

        // Interaction state
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.mouse3D = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.lastInteraction = 0;
        this.isInteracting = false;

        // Device detection
        this.isMobile = false;
        this.isTablet = false;

        // Bound handlers
        this._handleResize = this._onResize.bind(this);
        this._positionCanvas = this._updateCanvasPosition.bind(this);
        this._handleMouseMove = this._onMouseMove.bind(this);
        this._handleTouchMove = this._onTouchMove.bind(this);
        this._handleInteractionEnd = this._onInteractionEnd.bind(this);
    }

    async init() {
        this._detectDevice();

        this.container = document.createElement('div');
        this.container.id = this.containerId;
        this.container.style.cssText = 'position: fixed; left: 0; width: 100vw; z-index: 1; pointer-events: auto;';
        document.body.appendChild(this.container);

        this._updateCanvasPosition();
        window.addEventListener('resize', this._positionCanvas);
        window.addEventListener('scroll', this._positionCanvas);

        try {
            this._setupScene();
            this._createGeometry();
            this._setupInteraction();
            this._startRenderLoop();
            window.addEventListener('resize', this._handleResize);
            return true;
        } catch (err) {
            console.error('Failed to initialize Zen Geometry Scene:', err);
            this.destroy();
            return false;
        }
    }

    _detectDevice() {
        const width = window.innerWidth;
        this.isMobile = width < 768;
        this.isTablet = width >= 768 && width < 1024;
    }

    _updateCanvasPosition() {
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

        // Enforce minimum height for mobile/tablet for better immersion
        let canvasHeight = footerTop - headerHeight;
        const minHeight = this.isMobile ? window.innerHeight * 0.85 :
                          this.isTablet ? window.innerHeight * 0.8 : 0;

        if (minHeight > 0 && canvasHeight < minHeight) {
            canvasHeight = minHeight;
        }

        this.container.style.top = headerHeight + 'px';
        this.container.style.height = canvasHeight + 'px';
    }

    _getColors() {
        const scheme = document.body.getAttribute('data-md-color-scheme');
        const isDark = scheme === 'slate';

        // Dark mode: warm amber/gold tones - like a calm ember, workshop lighting
        // Light mode: clean grayscale - precise, architectural
        return isDark ? {
            background: 0x0a0908,
            nodeColor: 0xd4a574,
            lineColor: 0x8b6914,
            centralColor: 0xe8c496,
            particleColor: 0xc9a227,
            glowColor: 0xffa500,
            ambientLight: 0x2a1a0a,
            fogColor: 0x0a0908,
            accentPulse: 0xffb84d,
        } : {
            background: 0xfafafa,
            nodeColor: 0x2a2a2a,
            lineColor: 0xcccccc,
            centralColor: 0x1a1a1a,
            particleColor: 0x888888,
            glowColor: 0x444444,
            ambientLight: 0xffffff,
            fogColor: 0xfafafa,
            accentPulse: 0x333333,
        };
    }

    _setupScene() {
        const colors = this._getColors();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.fogColor, 0.012);

        // Adjusted FOV for mobile/tablet - closer view
        const fov = this.isMobile ? 60 : this.isTablet ? 55 : 50;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);

        // Closer camera on mobile for better presence
        const camDistance = this.isMobile ? 14 : this.isTablet ? 16 : 20;
        this.camera.position.set(0, 0, camDistance);
        this.camera.userData.baseDistance = camDistance;

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // Lighting - warm and soft
        const ambient = new THREE.AmbientLight(colors.ambientLight, 0.5);
        this.scene.add(ambient);
        this.ambientLight = ambient;

        const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
        keyLight.position.set(5, 10, 7);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, -5, 5);
        this.scene.add(fillLight);

        // Theme observer
        this._setupThemeObserver();
    }

    _createGeometry() {
        const colors = this._getColors();

        // Central icosahedron - glass-like presence
        const icoSize = this.isMobile ? 2.2 : 2.5;
        const icoGeo = new THREE.IcosahedronGeometry(icoSize, 1);
        const icoMat = new THREE.MeshPhysicalMaterial({
            color: colors.centralColor,
            metalness: 0.1,
            roughness: 0.15,
            transmission: 0.9,
            thickness: 1.5,
            ior: 1.5,
            transparent: true,
            opacity: 0.7,
            emissive: colors.glowColor,
            emissiveIntensity: 0.05,
        });
        this.centralForm = new THREE.Mesh(icoGeo, icoMat);
        this.centralForm.userData = {
            baseEmissive: 0.05,
            targetEmissive: 0.05,
            pulsePhase: 0,
        };
        this.scene.add(this.centralForm);

        // Wireframe overlay
        const wireGeo = new THREE.IcosahedronGeometry(icoSize * 1.02, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: colors.lineColor,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });
        const wireframe = new THREE.Mesh(wireGeo, wireMat);
        this.centralForm.add(wireframe);
        this.centralForm.userData.wireframe = wireframe;

        // Orbiting nodes - positioned for mobile visibility
        const nodeScale = this.isMobile ? 0.85 : this.isTablet ? 0.9 : 1;
        const nodePositions = [
            { pos: [5 * nodeScale, 2.5 * nodeScale, -1.5], size: 0.3 * nodeScale },
            { pos: [-4.5 * nodeScale, -3.5 * nodeScale, 1], size: 0.28 * nodeScale },
            { pos: [3.5 * nodeScale, -4 * nodeScale, 2.5], size: 0.35 * nodeScale },
            { pos: [-5 * nodeScale, 2 * nodeScale, -2.5], size: 0.28 * nodeScale },
            { pos: [1.5 * nodeScale, 5 * nodeScale, 1.5], size: 0.24 * nodeScale },
            { pos: [-2.5 * nodeScale, -1.5 * nodeScale, 4], size: 0.32 * nodeScale },
            { pos: [4 * nodeScale, 0.5 * nodeScale, 3.5], size: 0.22 * nodeScale },
        ];

        nodePositions.forEach((config, i) => {
            const geo = new THREE.OctahedronGeometry(config.size, 0);
            const mat = new THREE.MeshPhysicalMaterial({
                color: colors.nodeColor,
                metalness: 0.2,
                roughness: 0.25,
                emissive: colors.glowColor,
                emissiveIntensity: 0.08,
            });
            const node = new THREE.Mesh(geo, mat);
            node.position.set(...config.pos);
            node.userData = {
                basePos: new THREE.Vector3(...config.pos),
                orbitSpeed: 0.08 + Math.random() * 0.08,
                orbitRadius: 0.25 + Math.random() * 0.4,
                phase: Math.random() * Math.PI * 2,
                floatSpeed: 0.15 + Math.random() * 0.25,
                baseEmissive: 0.08,
                targetEmissive: 0.08,
                breathePhase: Math.random() * Math.PI * 2,
                breatheSpeed: 0.3 + Math.random() * 0.4,
            };
            this.scene.add(node);
            this.nodes.push(node);
        });

        // Connecting lines
        this._createConnections(colors);

        // Minimal particles
        this._createParticles(colors);
    }

    _createConnections(colors) {
        const lineMat = new THREE.LineBasicMaterial({
            color: colors.lineColor,
            transparent: true,
            opacity: 0.12,
        });

        // Connect nodes to center and each other
        const connectionPairs = [
            [null, 0], [null, 1], [null, 2],
            [0, 4], [1, 5], [2, 3], [3, 6], [4, 6],
        ];

        connectionPairs.forEach(([fromIdx, toIdx]) => {
            const points = [];
            const from = fromIdx === null ? new THREE.Vector3(0, 0, 0) : this.nodes[fromIdx].position;
            const to = this.nodes[toIdx].position;
            points.push(from.clone(), to.clone());

            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, lineMat.clone());
            line.userData = { fromIdx, toIdx, baseOpacity: 0.12, targetOpacity: 0.12 };
            this.scene.add(line);
            this.connections.push(line);
        });
    }

    _createParticles(colors) {
        const count = this.isMobile ? 25 : 40;
        this.particlePositions = new Float32Array(count * 3);
        this.particleVelocities = [];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            this.particlePositions[i3] = (Math.random() - 0.5) * 50;
            this.particlePositions[i3 + 1] = (Math.random() - 0.5) * 40;
            this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 30 - 10;

            this.particleVelocities.push({
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.001,
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(this.particlePositions, 3));

        const mat = new THREE.PointsMaterial({
            color: colors.particleColor,
            size: this.isMobile ? 0.1 : 0.08,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true,
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    _setupInteraction() {
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('touchmove', this._handleTouchMove, { passive: true });
        this.container.addEventListener('mouseleave', this._handleInteractionEnd);
        this.container.addEventListener('touchend', this._handleInteractionEnd);
    }

    _onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.lastInteraction = this.clock.getElapsedTime();
        this.isInteracting = true;
        this._updateMouse3D();
    }

    _onTouchMove(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            this.lastInteraction = this.clock.getElapsedTime();
            this.isInteracting = true;
            this._updateMouse3D();
        }
    }

    _onInteractionEnd() {
        this.isInteracting = false;
    }

    _updateMouse3D() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.interactionPlane, intersectPoint);
        if (intersectPoint) {
            this.mouse3D.copy(intersectPoint);
        }
    }

    _setupThemeObserver() {
        let currentScheme = document.body.getAttribute('data-md-color-scheme');

        this.themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-md-color-scheme') {
                    const newScheme = document.body.getAttribute('data-md-color-scheme');
                    if (newScheme !== currentScheme) {
                        currentScheme = newScheme;
                        this._updateTheme();
                    }
                }
            });
        });

        this.themeObserver.observe(document.body, { attributes: true });
    }

    _updateTheme() {
        const colors = this._getColors();

        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);

        this.centralForm.material.color.setHex(colors.centralColor);
        this.centralForm.material.emissive.setHex(colors.glowColor);
        this.centralForm.userData.wireframe.material.color.setHex(colors.lineColor);

        this.nodes.forEach(node => {
            node.material.color.setHex(colors.nodeColor);
            node.material.emissive.setHex(colors.glowColor);
        });

        this.connections.forEach(line => {
            line.material.color.setHex(colors.lineColor);
        });

        this.particles.material.color.setHex(colors.particleColor);
    }

    _onResize() {
        this._detectDevice();
        this._updateCanvasPosition();
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // Update camera FOV for device
        this.camera.fov = this.isMobile ? 60 : this.isTablet ? 55 : 50;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Update base distance
        this.camera.userData.baseDistance = this.isMobile ? 14 : this.isTablet ? 16 : 20;

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();
            const timeSinceInteraction = elapsed - this.lastInteraction;
            const interactionFade = Math.max(0, 1 - timeSinceInteraction / 2);

            // Slow camera orbit with slight interaction response
            const camDistance = this.camera.userData.baseDistance;
            const camSpeed = 0.025;
            let camX = Math.sin(elapsed * camSpeed) * camDistance;
            let camZ = Math.cos(elapsed * camSpeed) * camDistance;
            let camY = Math.sin(elapsed * camSpeed * 0.4) * 2.5;

            // Subtle camera pull toward interaction point
            if (this.isInteracting && interactionFade > 0) {
                camX += this.mouse3D.x * 0.5 * interactionFade;
                camY += this.mouse3D.y * 0.3 * interactionFade;
            }

            this.camera.position.set(camX, camY, camZ);
            this.camera.lookAt(0, 0, 0);

            // Central form - gentle rotation with heartbeat pulse
            this.centralForm.rotation.x = elapsed * 0.04;
            this.centralForm.rotation.y = elapsed * 0.06;

            // Heartbeat breathing - two pulses then rest
            const heartbeatCycle = (elapsed * 0.5) % (Math.PI * 2);
            const pulse1 = Math.max(0, Math.sin(heartbeatCycle * 2) * 0.5);
            const pulse2 = Math.max(0, Math.sin((heartbeatCycle - 0.3) * 2) * 0.3);
            const heartbeat = pulse1 + pulse2;
            const breathe = 1 + heartbeat * 0.015;
            this.centralForm.scale.setScalar(breathe);

            // Central form responds to interaction
            const centralData = this.centralForm.userData;
            if (this.isInteracting) {
                const distToCenter = this.mouse3D.length();
                if (distToCenter < 5) {
                    centralData.targetEmissive = 0.15 + (1 - distToCenter / 5) * 0.1;
                } else {
                    centralData.targetEmissive = 0.05;
                }
            } else {
                centralData.targetEmissive = 0.05;
            }
            centralData.baseEmissive += (centralData.targetEmissive - centralData.baseEmissive) * 0.05;
            this.centralForm.material.emissiveIntensity = centralData.baseEmissive + heartbeat * 0.03;

            // Animate nodes with individual breathing and interaction response
            this.nodes.forEach((node) => {
                const data = node.userData;

                // Orbital movement
                node.position.x = data.basePos.x + Math.sin(elapsed * data.orbitSpeed + data.phase) * data.orbitRadius;
                node.position.y = data.basePos.y + Math.cos(elapsed * data.floatSpeed + data.phase) * data.orbitRadius * 0.5;
                node.position.z = data.basePos.z + Math.sin(elapsed * data.orbitSpeed * 0.7 + data.phase) * data.orbitRadius * 0.3;

                // Individual breathing
                const nodeBreathe = 1 + Math.sin(elapsed * data.breatheSpeed + data.breathePhase) * 0.08;
                node.scale.setScalar(nodeBreathe);

                // Gentle rotation
                node.rotation.x = elapsed * 0.15;
                node.rotation.y = elapsed * 0.25;

                // Interaction response - glow when cursor is near
                if (this.isInteracting) {
                    const distToMouse = node.position.distanceTo(this.mouse3D);
                    if (distToMouse < 4) {
                        data.targetEmissive = 0.25 + (1 - distToMouse / 4) * 0.3;
                    } else {
                        data.targetEmissive = 0.08;
                    }
                } else {
                    data.targetEmissive = 0.08;
                }
                data.baseEmissive += (data.targetEmissive - data.baseEmissive) * 0.08;
                node.material.emissiveIntensity = data.baseEmissive;
            });

            // Update connection lines with interaction glow
            this.connections.forEach((line) => {
                const { fromIdx, toIdx } = line.userData;
                const positions = line.geometry.attributes.position.array;

                const from = fromIdx === null ? this.centralForm.position : this.nodes[fromIdx].position;
                const to = this.nodes[toIdx].position;

                positions[0] = from.x;
                positions[1] = from.y;
                positions[2] = from.z;
                positions[3] = to.x;
                positions[4] = to.y;
                positions[5] = to.z;

                line.geometry.attributes.position.needsUpdate = true;

                // Brighten lines connected to glowing nodes
                const fromEmissive = fromIdx === null ? this.centralForm.userData.baseEmissive : this.nodes[fromIdx].userData.baseEmissive;
                const toEmissive = this.nodes[toIdx].userData.baseEmissive;
                const lineGlow = Math.max(fromEmissive, toEmissive);
                line.userData.targetOpacity = 0.12 + lineGlow * 0.4;
                line.userData.baseOpacity += (line.userData.targetOpacity - line.userData.baseOpacity) * 0.1;
                line.material.opacity = line.userData.baseOpacity;
            });

            // Particle drift
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < this.particleVelocities.length; i++) {
                const i3 = i * 3;
                const vel = this.particleVelocities[i];

                positions[i3] += vel.x;
                positions[i3 + 1] += vel.y;
                positions[i3 + 2] += vel.z;

                if (positions[i3] > 25) positions[i3] = -25;
                if (positions[i3] < -25) positions[i3] = 25;
                if (positions[i3 + 1] > 20) positions[i3 + 1] = -20;
                if (positions[i3 + 1] < -20) positions[i3 + 1] = 20;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    destroy() {
        this.isDestroyed = true;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        window.removeEventListener('resize', this._handleResize);
        window.removeEventListener('resize', this._positionCanvas);
        window.removeEventListener('scroll', this._positionCanvas);

        this.container.removeEventListener('mousemove', this._handleMouseMove);
        this.container.removeEventListener('touchmove', this._handleTouchMove);
        this.container.removeEventListener('mouseleave', this._handleInteractionEnd);
        this.container.removeEventListener('touchend', this._handleInteractionEnd);

        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        this.scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });

        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
