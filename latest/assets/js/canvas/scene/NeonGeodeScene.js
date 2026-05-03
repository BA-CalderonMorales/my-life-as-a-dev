/**
 * Neon Geode Scene
 *
 * Electric mineral chamber: saturated crystals, a visible radiant core,
 * and emissive dust moving through a mirror-dark cavity.
 */
import * as THREE from 'three';

export class NeonGeodeScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.createdContainer = false;
        this.isEmbedded = false;
        this.isMobile = false;
        this.clock = new THREE.Clock();

        this.geodeGroup = null;
        this.core = null;
        this.crystals = [];
        this.lights = [];
        this.sparkles = null;
        this.sparkleVelocities = null;

        this._boundUpdatePosition = this._updateCanvasPosition.bind(this);
        this._boundResize = this._onResize.bind(this);
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        this.isEmbedded = Boolean(this.container);

        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
            this.createdContainer = true;
        }

        this.isMobile = window.innerWidth < 768;
        this._updateCanvasPosition();
        window.addEventListener('resize', this._boundResize);
        window.addEventListener('scroll', this._boundUpdatePosition);

        try {
            this._setupScene();
            this._createEnvironment();
            this._createGeode();
            this._createSparkles();
            this._startRenderLoop();
            return true;
        } catch (err) {
            console.error('Failed to initialize Neon Geode Scene:', err);
            this.destroy();
            return false;
        }
    }

    _getViewportSize() {
        const rect = this.container.getBoundingClientRect();
        return {
            width: Math.max(this.container.clientWidth || rect.width || window.innerWidth || 1, 1),
            height: Math.max(this.container.clientHeight || rect.height || window.innerHeight || 1, 1),
        };
    }

    _setupScene() {
        const { width, height } = this._getViewportSize();
        const pixelRatio = Math.min(window.devicePixelRatio, this.isMobile ? 1.35 : 1.75);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x04030a);
        this.scene.fog = new THREE.FogExp2(0x04030a, 0.028);

        this.camera = new THREE.PerspectiveCamera(this.isMobile ? 58 : 50, width / height, 0.1, 100);
        this.camera.position.set(0, 3.2, this.isMobile ? 11 : 10.5);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance',
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.35;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);
    }

    _createEnvironment() {
        const floor = new THREE.Mesh(
            new THREE.CircleGeometry(18, 96),
            new THREE.MeshStandardMaterial({
                color: 0x08070d,
                metalness: 0.82,
                roughness: 0.16,
                emissive: 0x130018,
                emissiveIntensity: 0.22,
            })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        this.scene.add(floor);

        this.scene.add(new THREE.HemisphereLight(0x252570, 0x030308, 0.72));
        this.scene.add(new THREE.AmbientLight(0x15142a, 0.46));

        [
            { color: 0xff1ab3, position: [-3.4, 2.4, 2.8], intensity: 2.7 },
            { color: 0x00f6ff, position: [3.2, 1.8, 3.1], intensity: 2.5 },
            { color: 0x9c3cff, position: [0, 4.4, -2.2], intensity: 2.2 },
        ].forEach((config) => {
            const light = new THREE.PointLight(config.color, config.intensity, 13);
            light.position.set(...config.position);
            this.scene.add(light);
            this.lights.push(light);
        });
    }

    _createGeode() {
        const palette = [0xff1ab3, 0x00f6ff, 0x9c3cff, 0x35ffcf];
        const crystalCount = this.isMobile ? 18 : 34;
        this.geodeGroup = new THREE.Group();
        this.scene.add(this.geodeGroup);

        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0xb7ffff,
            emissive: 0x00f6ff,
            emissiveIntensity: 1.6,
            metalness: 0.12,
            roughness: 0.18,
            transparent: true,
            opacity: 0.88,
        });
        this.core = new THREE.Mesh(new THREE.IcosahedronGeometry(this.isMobile ? 0.82 : 1.08, 2), coreMaterial);
        this.core.position.set(0, -0.55, 0);
        this.geodeGroup.add(this.core);

        for (let i = 0; i < crystalCount; i++) {
            const color = palette[i % palette.length];
            const spread = i / Math.max(crystalCount - 1, 1);
            const angle = spread * Math.PI * 8 + Math.sin(i * 12.9898) * 0.28;
            const dist = 0.8 + Math.pow(spread, 0.7) * (this.isMobile ? 4.2 : 5.4);
            const height = (i < 5 ? 2.3 : 1.15) + (Math.sin(i * 78.233) * 0.5 + 0.5) * 2.35;
            const radius = 0.18 + (Math.sin(i * 31.719) * 0.5 + 0.5) * 0.32;

            const crystal = new THREE.Mesh(
                new THREE.ConeGeometry(radius, height, 5),
                new THREE.MeshStandardMaterial({
                    color,
                    emissive: color,
                    emissiveIntensity: 1.05 + (i % 5) * 0.12,
                    metalness: 0.22,
                    roughness: 0.16,
                })
            );

            crystal.position.set(
                Math.cos(angle) * dist,
                -2 + height / 2,
                Math.sin(angle) * dist
            );
            crystal.rotation.x = Math.sin(angle) * 0.22;
            crystal.rotation.y = angle;
            crystal.rotation.z = Math.cos(angle) * 0.24;
            crystal.userData = {
                baseEmissive: crystal.material.emissiveIntensity,
                pulseSpeed: 0.75 + (i % 7) * 0.18,
                pulseOffset: i * 0.71,
            };

            this.geodeGroup.add(crystal);
            this.crystals.push(crystal);
        }
    }

    _createSparkles() {
        const count = this.isMobile ? 320 : 720;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        this.sparkleVelocities = new Float32Array(count * 3);

        const palette = [
            new THREE.Color(0xff1ab3),
            new THREE.Color(0x00f6ff),
            new THREE.Color(0x9c3cff),
            new THREE.Color(0x35ffcf),
        ];

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.2 + Math.random() * 7.2;
            const color = palette[i % palette.length];

            positions[idx] = Math.cos(angle) * radius;
            positions[idx + 1] = -1.45 + Math.random() * 5.8;
            positions[idx + 2] = Math.sin(angle) * radius;
            colors[idx] = color.r;
            colors[idx + 1] = color.g;
            colors[idx + 2] = color.b;
            this.sparkleVelocities[idx] = (Math.random() - 0.5) * 0.0025;
            this.sparkleVelocities[idx + 1] = 0.003 + Math.random() * 0.006;
            this.sparkleVelocities[idx + 2] = (Math.random() - 0.5) * 0.0025;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.sparkles = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                size: this.isMobile ? 0.06 : 0.045,
                vertexColors: true,
                transparent: true,
                opacity: 0.86,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true,
            })
        );
        this.scene.add(this.sparkles);
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();
            const camRadius = this.isMobile ? 10.5 : 10.2;
            this.camera.position.x = Math.sin(elapsed * 0.09) * camRadius;
            this.camera.position.y = 2.7 + Math.sin(elapsed * 0.18) * 0.45;
            this.camera.position.z = Math.cos(elapsed * 0.09) * camRadius;
            this.camera.lookAt(0, -0.35, 0);

            this.geodeGroup.rotation.y = elapsed * 0.035;
            this.core.rotation.x = elapsed * 0.28;
            this.core.rotation.y = elapsed * 0.42;
            const corePulse = 1 + Math.sin(elapsed * 2.6) * 0.055;
            this.core.scale.setScalar(corePulse);
            this.core.material.emissiveIntensity = 1.55 + Math.sin(elapsed * 3.2) * 0.34;

            this.crystals.forEach((crystal) => {
                const data = crystal.userData;
                const pulse = Math.sin(elapsed * data.pulseSpeed + data.pulseOffset);
                crystal.material.emissiveIntensity = data.baseEmissive + pulse * 0.28;
            });

            this.lights.forEach((light, index) => {
                light.intensity = 2.2 + Math.sin(elapsed * (0.9 + index * 0.18)) * 0.45;
            });

            this._updateSparkles();
            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    _updateSparkles() {
        const positions = this.sparkles.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += this.sparkleVelocities[i] + Math.sin(positions[i + 1] * 0.7) * 0.0018;
            positions[i + 1] += this.sparkleVelocities[i + 1];
            positions[i + 2] += this.sparkleVelocities[i + 2] + Math.cos(positions[i + 1] * 0.6) * 0.0018;

            if (positions[i + 1] > 4.6) {
                positions[i + 1] = -1.6;
            }
        }

        this.sparkles.geometry.attributes.position.needsUpdate = true;
    }

    _updateCanvasPosition() {
        if (this.isEmbedded) {
            this.container.style.top = '';
            this.container.style.height = '';
            return;
        }

        const header = document.querySelector('.md-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const viewportHeight = Math.max(window.innerHeight - headerHeight, 0);
        document.documentElement.style.setProperty('--canvas-header-offset', `${headerHeight}px`);
        this.container.style.top = headerHeight + 'px';
        this.container.style.height = viewportHeight + 'px';
    }

    _onResize() {
        this.isMobile = window.innerWidth < 768;
        this._updateCanvasPosition();
        if (!this.camera || !this.renderer || !this.container) return;

        const { width, height } = this._getViewportSize();
        this.camera.fov = this.isMobile ? 58 : 50;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.35 : 1.75));
    }

    destroy() {
        this.isDestroyed = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this._boundResize);
        window.removeEventListener('scroll', this._boundUpdatePosition);

        if (this.scene) {
            this.scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach((material) => material.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }

        if (this.createdContainer && this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
