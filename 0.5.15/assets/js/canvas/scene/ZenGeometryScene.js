/**
 * Zen Geometry Scene
 *
 * Minimalist geometric visualization representing calm, precise systems.
 * Interconnected nodes with clean lines - like well-architected infrastructure.
 * Responsive design with touch/mouse interaction for an organic, alive feel.
 */
import * as THREE from 'three';
import {
    ZEN_CONNECTIONS,
    ZEN_GEOMETRY_THEMES,
    ZEN_NODE_DEFINITIONS
} from './ZenGeometryModel.js';

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

        // Touch state
        this.isTouching = false;
        this.isPinching = false;
        this.touchStartTime = 0;
        this.touchStartPosition = { x: 0, y: 0 };
        this.previousTouchPosition = { x: 0, y: 0 };
        this.pinchStartDistance = 0;
        this.touchMoved = false;
        this.touchSensitivity = 0.008;

        // Camera orbit state (driven by touch drag)
        this.orbitAngle = 0;
        this.orbitTilt = 0;

        // Device detection
        this.isMobile = false;
        this.isTablet = false;

        // Bound handlers
        this._handleResize = this._onResize.bind(this);
        this._positionCanvas = this._updateCanvasPosition.bind(this);
        this._handleMouseMove = this._onMouseMove.bind(this);
        this._handleTouchStart = this._onTouchStart.bind(this);
        this._handleTouchMove = this._onTouchMove.bind(this);
        this._handleTouchEnd = this._onTouchEnd.bind(this);
        this._handleInteractionEnd = this._onInteractionEnd.bind(this);
        this._handleOrientationChange = this._onOrientationChange.bind(this);
    }

    async init() {
        this._detectDevice();

        this.container = document.createElement('div');
        this.container.id = this.containerId;
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
        const headerHeight = header ? header.offsetHeight : 0;
        const viewportHeight = Math.max(window.innerHeight - headerHeight, 0);

        document.documentElement.style.setProperty('--canvas-header-offset', `${headerHeight}px`);
        this.container.style.top = headerHeight + 'px';
        this.container.style.height = viewportHeight + 'px';
    }

    _getColors() {
        const scheme = document.body.getAttribute('data-md-color-scheme');
        return scheme === 'slate' ? ZEN_GEOMETRY_THEMES.dark : ZEN_GEOMETRY_THEMES.light;
    }

    _setupScene() {
        const colors = this._getColors();
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.fogColor, 0.009);

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
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        const ambient = new THREE.AmbientLight(colors.ambientLight, isDark ? 0.46 : 0.7);
        this.scene.add(ambient);
        this.ambientLight = ambient;

        const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.5 : 0.62);
        keyLight.position.set(5, 10, 7);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xb7b5af, isDark ? 0.18 : 0.22);
        fillLight.position.set(-6, -4, 4);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.16 : 0.12);
        rimLight.position.set(0, 2, -6);
        this.scene.add(rimLight);

        // Theme observer
        this._setupThemeObserver();
    }

    _createGeometry() {
        const colors = this._getColors();

        // Central icosahedron - matte centerpiece
        const icoSize = this.isMobile ? 2.2 : 2.5;
        const icoGeo = new THREE.IcosahedronGeometry(icoSize, 1);
        const icoMat = new THREE.MeshPhysicalMaterial({
            color: colors.centralColor,
            metalness: 0.04,
            roughness: 0.56,
            transmission: 0.18,
            thickness: 0.8,
            ior: 1.12,
            transparent: true,
            opacity: 0.94,
            clearcoat: 0.08,
            clearcoatRoughness: 0.32,
            emissive: colors.glowColor,
            emissiveIntensity: 0.014,
        });
        this.centralForm = new THREE.Mesh(icoGeo, icoMat);
        this.centralForm.userData = {
            baseEmissive: 0.014,
            targetEmissive: 0.014,
        };
        this.scene.add(this.centralForm);

        // Wireframe overlay
        const wireGeo = new THREE.IcosahedronGeometry(icoSize * 1.02, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: colors.lineColor,
            wireframe: true,
            transparent: true,
            opacity: 0.14,
        });
        const wireframe = new THREE.Mesh(wireGeo, wireMat);
        this.centralForm.add(wireframe);
        this.centralForm.userData.wireframe = wireframe;

        // Orbiting nodes - positioned for mobile visibility
        const nodeScale = this.isMobile ? 0.85 : this.isTablet ? 0.9 : 1;
        ZEN_NODE_DEFINITIONS.forEach((config) => {
            const geo = new THREE.OctahedronGeometry(config.size * nodeScale, 0);
            const mat = new THREE.MeshPhysicalMaterial({
                color: colors.nodeColor,
                metalness: 0.02,
                roughness: 0.72,
                emissive: colors.glowColor,
                emissiveIntensity: 0.03,
            });
            const node = new THREE.Mesh(geo, mat);
            const scaledPosition = config.position.map((value, index) =>
                index < 2 ? value * nodeScale : value
            );
            node.position.set(...scaledPosition);
            node.userData = {
                basePos: new THREE.Vector3(...scaledPosition),
                orbitSpeed: 0.05 + Math.random() * 0.04,
                orbitRadius: 0.18 + Math.random() * 0.2,
                phase: Math.random() * Math.PI * 2,
                floatSpeed: 0.12 + Math.random() * 0.16,
                baseEmissive: 0.03,
                targetEmissive: 0.03,
                breathePhase: Math.random() * Math.PI * 2,
                breatheSpeed: 0.22 + Math.random() * 0.28,
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
            opacity: 0.08,
        });

        ZEN_CONNECTIONS.forEach(([fromIdx, toIdx]) => {
            const points = [];
            const from = fromIdx === null ? new THREE.Vector3(0, 0, 0) : this.nodes[fromIdx].position;
            const to = this.nodes[toIdx].position;
            points.push(from.clone(), to.clone());

            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, lineMat.clone());
            line.userData = { fromIdx, toIdx, baseOpacity: 0.08, targetOpacity: 0.08 };
            this.scene.add(line);
            this.connections.push(line);
        });
    }

    _createParticles(colors) {
        const count = this.isMobile ? 18 : 28;
        this.particlePositions = new Float32Array(count * 3);
        this.particleVelocities = [];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            this.particlePositions[i3] = (Math.random() - 0.5) * 36;
            this.particlePositions[i3 + 1] = (Math.random() - 0.5) * 28;
            this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 24 - 8;

            this.particleVelocities.push({
                x: (Math.random() - 0.5) * 0.0012,
                y: (Math.random() - 0.5) * 0.0012,
                z: (Math.random() - 0.5) * 0.0007,
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(this.particlePositions, 3));

        const mat = new THREE.PointsMaterial({
            color: colors.particleColor,
            size: this.isMobile ? 0.09 : 0.07,
            transparent: true,
            opacity: 0.18,
            sizeAttenuation: true,
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    _setupInteraction() {
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('mouseleave', this._handleInteractionEnd);

        // Touch events
        this.container.addEventListener('touchstart', this._handleTouchStart, { passive: false });
        this.container.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        this.container.addEventListener('touchend', this._handleTouchEnd, { passive: true });
        this.container.addEventListener('touchcancel', this._handleTouchEnd, { passive: true });

        // Orientation change for mobile/tablet
        window.addEventListener('orientationchange', this._handleOrientationChange);
    }

    _onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.lastInteraction = this.clock.getElapsedTime();
        this.isInteracting = true;
        this._updateMouse3D();
    }

    // --- Touch handlers ---

    _getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _onTouchStart(event) {
        event.preventDefault();

        if (event.touches.length === 1) {
            this.isTouching = true;
            this.touchMoved = false;
            this.touchStartTime = Date.now();
            this.touchStartPosition.x = event.touches[0].clientX;
            this.touchStartPosition.y = event.touches[0].clientY;
            this.previousTouchPosition.x = event.touches[0].clientX;
            this.previousTouchPosition.y = event.touches[0].clientY;

            this._updateMouseFromTouch(event.touches[0]);
            this.lastInteraction = this.clock.getElapsedTime();
            this.isInteracting = true;
        } else if (event.touches.length === 2) {
            this.isPinching = true;
            this.isTouching = false;
            this.pinchStartDistance = this._getTouchDistance(event.touches);
        }
    }

    _onTouchMove(event) {
        event.preventDefault();

        if (event.touches.length === 1 && this.isTouching) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.previousTouchPosition.x;
            const deltaY = touch.clientY - this.previousTouchPosition.y;

            // Detect movement past threshold
            const totalDX = touch.clientX - this.touchStartPosition.x;
            const totalDY = touch.clientY - this.touchStartPosition.y;
            if (Math.abs(totalDX) > 10 || Math.abs(totalDY) > 10) {
                this.touchMoved = true;
            }

            // Orbit camera via touch drag
            this.orbitAngle += deltaX * this.touchSensitivity;
            this.orbitTilt = Math.max(-0.5, Math.min(0.5, this.orbitTilt + deltaY * this.touchSensitivity));

            this.previousTouchPosition.x = touch.clientX;
            this.previousTouchPosition.y = touch.clientY;

            this._updateMouseFromTouch(touch);
            this.lastInteraction = this.clock.getElapsedTime();
            this.isInteracting = true;

        } else if (event.touches.length === 2 && this.isPinching) {
            const currentDistance = this._getTouchDistance(event.touches);
            const delta = (this.pinchStartDistance - currentDistance) * 0.05;

            // Adjust camera distance via pinch
            const baseDistance = this.camera.userData.baseDistance;
            const minDist = baseDistance * 0.5;
            const maxDist = baseDistance * 1.8;
            this.camera.userData.baseDistance = Math.max(minDist, Math.min(maxDist, baseDistance + delta));

            this.pinchStartDistance = currentDistance;
            this.lastInteraction = this.clock.getElapsedTime();
            this.isInteracting = true;
        }
    }

    _onTouchEnd() {
        // Tap detection
        if (this.isTouching && !this.touchMoved) {
            const duration = Date.now() - this.touchStartTime;
            if (duration < 300) {
                // Raycast to check if a node was tapped
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.nodes);

                if (intersects.length > 0) {
                    // Tap on node: zoom closer
                    const node = intersects[0].object;
                    const nodePos = node.position.clone();
                    const dir = nodePos.clone().normalize();
                    const zoomDist = this.isMobile ? 8 : 10;
                    this.camera.userData.baseDistance = zoomDist;
                    this.orbitAngle = Math.atan2(dir.x, dir.z);
                    this.orbitTilt = Math.asin(Math.max(-0.5, Math.min(0.5, dir.y / nodePos.length())));
                } else {
                    // Tap on empty space: reset
                    const defaultDist = this.isMobile ? 14 : this.isTablet ? 16 : 20;
                    this.camera.userData.baseDistance = defaultDist;
                    this.orbitAngle = 0;
                    this.orbitTilt = 0;
                }
            }
        }

        this.isTouching = false;
        this.isPinching = false;
        this.touchMoved = false;
        this.isInteracting = false;
    }

    _updateMouseFromTouch(touch) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        this._updateMouse3D();
    }

    _onInteractionEnd() {
        this.isInteracting = false;
    }

    _onOrientationChange() {
        // Delay resize to let the browser settle after orientation change
        setTimeout(() => {
            this._onResize();
        }, 150);
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
            const interactionFade = Math.max(0, 1 - timeSinceInteraction / 2.4);

            // Camera orbit: auto-orbit + touch-driven offset
            const camDistance = this.camera.userData.baseDistance;
            const camSpeed = 0.018;
            const autoAngle = elapsed * camSpeed;
            const totalAngle = autoAngle + this.orbitAngle;
            let camX = Math.sin(totalAngle) * camDistance;
            let camZ = Math.cos(totalAngle) * camDistance;
            let camY = Math.sin(elapsed * camSpeed * 0.4) * 1.4 + this.orbitTilt * camDistance * 0.24;

            // Subtle camera pull toward interaction point (mouse only)
            if (this.isInteracting && !this.isTouching && !this.isPinching && interactionFade > 0) {
                camX += this.mouse3D.x * 0.5 * interactionFade;
                camY += this.mouse3D.y * 0.3 * interactionFade;
            }

            this.camera.position.set(camX, camY, camZ);
            this.camera.lookAt(0, 0, 0);

            // Central form - gentle rotation with heartbeat pulse
            this.centralForm.rotation.x = elapsed * 0.02;
            this.centralForm.rotation.y = elapsed * 0.03;

            const breathe = 1 + Math.sin(elapsed * 0.45) * 0.01;
            this.centralForm.scale.setScalar(breathe);

            // Central form responds to interaction
            const centralData = this.centralForm.userData;
            if (this.isInteracting) {
                const distToCenter = this.mouse3D.length();
                if (distToCenter < 5) {
                    centralData.targetEmissive = 0.05 + (1 - distToCenter / 5) * 0.03;
                } else {
                    centralData.targetEmissive = 0.014;
                }
            } else {
                centralData.targetEmissive = 0.014;
            }
            centralData.baseEmissive += (centralData.targetEmissive - centralData.baseEmissive) * 0.04;
            this.centralForm.material.emissiveIntensity = centralData.baseEmissive;

            // Animate nodes with individual breathing and interaction response
            this.nodes.forEach((node) => {
                const data = node.userData;

                // Orbital movement
                node.position.x = data.basePos.x + Math.sin(elapsed * data.orbitSpeed + data.phase) * data.orbitRadius;
                node.position.y = data.basePos.y + Math.cos(elapsed * data.floatSpeed + data.phase) * data.orbitRadius * 0.5;
                node.position.z = data.basePos.z + Math.sin(elapsed * data.orbitSpeed * 0.7 + data.phase) * data.orbitRadius * 0.3;

                // Individual breathing
                const nodeBreathe = 1 + Math.sin(elapsed * data.breatheSpeed + data.breathePhase) * 0.05;
                node.scale.setScalar(nodeBreathe);

                // Gentle rotation
                node.rotation.x = elapsed * 0.08;
                node.rotation.y = elapsed * 0.12;

                // Interaction response - glow when cursor is near
                if (this.isInteracting) {
                    const distToMouse = node.position.distanceTo(this.mouse3D);
                    if (distToMouse < 3.5) {
                        data.targetEmissive = 0.07 + (1 - distToMouse / 3.5) * 0.05;
                    } else {
                        data.targetEmissive = 0.03;
                    }
                } else {
                    data.targetEmissive = 0.03;
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
                line.userData.targetOpacity = 0.08 + lineGlow * 0.18;
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

                if (positions[i3] > 18) positions[i3] = -18;
                if (positions[i3] < -18) positions[i3] = 18;
                if (positions[i3 + 1] > 14) positions[i3 + 1] = -14;
                if (positions[i3 + 1] < -14) positions[i3 + 1] = 14;
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
        window.removeEventListener('orientationchange', this._handleOrientationChange);

        this.container.removeEventListener('mousemove', this._handleMouseMove);
        this.container.removeEventListener('mouseleave', this._handleInteractionEnd);
        this.container.removeEventListener('touchstart', this._handleTouchStart);
        this.container.removeEventListener('touchmove', this._handleTouchMove);
        this.container.removeEventListener('touchend', this._handleTouchEnd);
        this.container.removeEventListener('touchcancel', this._handleTouchEnd);

        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.scene) {
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
        }

        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
