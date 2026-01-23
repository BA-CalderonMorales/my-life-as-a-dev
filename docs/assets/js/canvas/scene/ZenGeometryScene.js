/**
 * Zen Geometry Scene
 *
 * Minimalist geometric visualization representing calm, precise systems.
 * Interconnected nodes with clean lines - like well-architected infrastructure.
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

        // Bound handlers
        this._handleResize = this._onResize.bind(this);
        this._positionCanvas = this._updateCanvasPosition.bind(this);
    }

    async init() {
        this.container = document.createElement('div');
        this.container.id = this.containerId;
        this.container.style.cssText = 'position: fixed; left: 0; width: 100vw; z-index: 1; pointer-events: none;';
        document.body.appendChild(this.container);

        this._updateCanvasPosition();
        window.addEventListener('resize', this._positionCanvas);
        window.addEventListener('scroll', this._positionCanvas);

        try {
            this._setupScene();
            this._createGeometry();
            this._startRenderLoop();
            window.addEventListener('resize', this._handleResize);
            return true;
        } catch (err) {
            console.error('Failed to initialize Zen Geometry Scene:', err);
            this.destroy();
            return false;
        }
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

        const canvasHeight = footerTop - headerHeight;
        this.container.style.top = headerHeight + 'px';
        this.container.style.height = canvasHeight + 'px';
    }

    _getColors() {
        const scheme = document.body.getAttribute('data-md-color-scheme');
        const isDark = scheme === 'slate';

        return isDark ? {
            background: 0x0a0a0f,
            nodeColor: 0x4a9eff,
            lineColor: 0x2a5a8f,
            centralColor: 0x6ab0ff,
            particleColor: 0x3a7abf,
            glowColor: 0x4a9eff,
            ambientLight: 0x1a2a3a,
            fogColor: 0x0a0a0f,
        } : {
            background: 0xfafafa,
            nodeColor: 0x2a2a2a,
            lineColor: 0xcccccc,
            centralColor: 0x1a1a1a,
            particleColor: 0x888888,
            glowColor: 0x333333,
            ambientLight: 0xffffff,
            fogColor: 0xfafafa,
        };
    }

    _setupScene() {
        const colors = this._getColors();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.fogColor, 0.015);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 20);

        const isMobile = window.innerWidth < 768;
        this.renderer = new THREE.WebGLRenderer({
            antialias: !isMobile,
            alpha: false,
            powerPreference: isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // Lighting - soft and minimal
        const ambient = new THREE.AmbientLight(colors.ambientLight, 0.4);
        this.scene.add(ambient);

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

        // Central icosahedron - wireframe for clean aesthetic
        const icoGeo = new THREE.IcosahedronGeometry(2.5, 1);
        const icoMat = new THREE.MeshPhysicalMaterial({
            color: colors.centralColor,
            metalness: 0.1,
            roughness: 0.2,
            transmission: 0.85,
            thickness: 1.5,
            ior: 1.5,
            transparent: true,
            opacity: 0.6,
        });
        this.centralForm = new THREE.Mesh(icoGeo, icoMat);
        this.scene.add(this.centralForm);

        // Wireframe overlay
        const wireGeo = new THREE.IcosahedronGeometry(2.55, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: colors.lineColor,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
        });
        const wireframe = new THREE.Mesh(wireGeo, wireMat);
        this.centralForm.add(wireframe);
        this.centralForm.userData.wireframe = wireframe;

        // Orbiting nodes - sparse constellation
        const nodePositions = [
            { pos: [6, 3, -2], size: 0.3 },
            { pos: [-5, -4, 1], size: 0.25 },
            { pos: [4, -5, 3], size: 0.35 },
            { pos: [-6, 2, -3], size: 0.28 },
            { pos: [2, 6, 2], size: 0.22 },
            { pos: [-3, -2, 5], size: 0.3 },
            { pos: [5, 1, 4], size: 0.2 },
        ];

        const nodeMat = new THREE.MeshPhysicalMaterial({
            color: colors.nodeColor,
            metalness: 0.2,
            roughness: 0.3,
            emissive: colors.glowColor,
            emissiveIntensity: 0.1,
        });

        nodePositions.forEach((config, i) => {
            const geo = new THREE.OctahedronGeometry(config.size, 0);
            const node = new THREE.Mesh(geo, nodeMat.clone());
            node.position.set(...config.pos);
            node.userData = {
                basePos: new THREE.Vector3(...config.pos),
                orbitSpeed: 0.1 + Math.random() * 0.1,
                orbitRadius: 0.3 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                floatSpeed: 0.2 + Math.random() * 0.3,
            };
            this.scene.add(node);
            this.nodes.push(node);
        });

        // Connecting lines - subtle infrastructure
        this._createConnections(colors);

        // Minimal particles - distant stars
        this._createParticles(colors);
    }

    _createConnections(colors) {
        const lineMat = new THREE.LineBasicMaterial({
            color: colors.lineColor,
            transparent: true,
            opacity: 0.15,
        });

        // Connect some nodes to center and each other
        const connectionPairs = [
            [null, 0], [null, 1], [null, 2], // Center to nodes
            [0, 4], [1, 5], [2, 3], [3, 6], // Node to node
        ];

        connectionPairs.forEach(([fromIdx, toIdx]) => {
            const points = [];
            const from = fromIdx === null ? new THREE.Vector3(0, 0, 0) : this.nodes[fromIdx].position;
            const to = this.nodes[toIdx].position;
            points.push(from.clone(), to.clone());

            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, lineMat.clone());
            line.userData = { fromIdx, toIdx };
            this.scene.add(line);
            this.connections.push(line);
        });
    }

    _createParticles(colors) {
        const count = 40; // Very sparse
        this.particlePositions = new Float32Array(count * 3);
        this.particleVelocities = [];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            // Spread far out
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
            size: 0.08,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true,
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
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

        // Update background
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);

        // Update central form
        this.centralForm.material.color.setHex(colors.centralColor);
        this.centralForm.userData.wireframe.material.color.setHex(colors.lineColor);

        // Update nodes
        this.nodes.forEach(node => {
            node.material.color.setHex(colors.nodeColor);
            node.material.emissive.setHex(colors.glowColor);
        });

        // Update connections
        this.connections.forEach(line => {
            line.material.color.setHex(colors.lineColor);
        });

        // Update particles
        this.particles.material.color.setHex(colors.particleColor);
    }

    _onResize() {
        this._updateCanvasPosition();
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();

            // Slow camera orbit
            const camRadius = 20;
            const camSpeed = 0.03;
            this.camera.position.x = Math.sin(elapsed * camSpeed) * camRadius;
            this.camera.position.z = Math.cos(elapsed * camSpeed) * camRadius;
            this.camera.position.y = Math.sin(elapsed * camSpeed * 0.5) * 3;
            this.camera.lookAt(0, 0, 0);

            // Central form - gentle rotation
            this.centralForm.rotation.x = elapsed * 0.05;
            this.centralForm.rotation.y = elapsed * 0.08;

            // Breathing scale
            const breathe = 1 + Math.sin(elapsed * 0.3) * 0.02;
            this.centralForm.scale.setScalar(breathe);

            // Animate nodes - slow orbital drift
            this.nodes.forEach((node) => {
                const { basePos, orbitSpeed, orbitRadius, phase, floatSpeed } = node.userData;
                node.position.x = basePos.x + Math.sin(elapsed * orbitSpeed + phase) * orbitRadius;
                node.position.y = basePos.y + Math.cos(elapsed * floatSpeed + phase) * orbitRadius * 0.5;
                node.position.z = basePos.z + Math.sin(elapsed * orbitSpeed * 0.7 + phase) * orbitRadius * 0.3;

                // Gentle rotation
                node.rotation.x = elapsed * 0.2;
                node.rotation.y = elapsed * 0.3;
            });

            // Update connection lines
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
            });

            // Particle drift
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < this.particleVelocities.length; i++) {
                const i3 = i * 3;
                const vel = this.particleVelocities[i];

                positions[i3] += vel.x;
                positions[i3 + 1] += vel.y;
                positions[i3 + 2] += vel.z;

                // Wrap around
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

        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        // Dispose geometries and materials
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
