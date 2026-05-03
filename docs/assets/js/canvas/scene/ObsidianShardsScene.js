/**
 * Obsidian Shards Scene
 *
 * Black floating monoliths with mirror-like surfaces.
 * Tall thin boxes spin in zero gravity above a subtle grid floor,
 * reflecting colored point lights.
 */
import * as THREE from 'three';

export class ObsidianShardsScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.createdContainer = false;
        this.clock = new THREE.Clock();

        this.monoliths = [];
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
        this._updateCanvasPosition();
        window.addEventListener('resize', this._boundResize);
        window.addEventListener('scroll', this._boundUpdatePosition);

        const isMobile = window.innerWidth < 768;
        const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        this.scene.fog = new THREE.FogExp2(0x111111, 0.015);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            55,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 3, 16);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: !isMobile,
            alpha: false,
            powerPreference: isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        // Grid floor
        const grid = new THREE.GridHelper(40, 40, 0x222222, 0x222222);
        grid.position.y = -4;
        this.scene.add(grid);

        // Ambient
        const ambient = new THREE.AmbientLight(0x222222, 0.4);
        this.scene.add(ambient);

        // Colored point lights for reflections
        const lightColors = [0xff3333, 0x3333ff, 0xffffff, 0xff3333, 0x3333ff];
        const lightPositions = [
            [8, 6, 6], [-8, 4, 5], [0, 8, 0], [6, -2, -6], [-5, 3, -7]
        ];
        lightPositions.forEach((pos, i) => {
            const pl = new THREE.PointLight(lightColors[i], 2, 20);
            pl.position.set(...pos);
            this.scene.add(pl);
        });

        // Monoliths
        const count = isMobile ? 8 : 15;
        for (let i = 0; i < count; i++) {
            const w = 0.3 + Math.random() * 0.4;
            const h = 3 + Math.random() * 5;
            const d = 0.2 + Math.random() * 0.3;
            const geo = new THREE.BoxGeometry(w, h, d);
            const mat = new THREE.MeshPhysicalMaterial({
                color: 0x050505,
                metalness: 1.0,
                roughness: 0.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.0,
            });
            const monolith = new THREE.Mesh(geo, mat);

            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 7;
            monolith.position.set(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 4,
                Math.sin(angle) * dist
            );
            monolith.rotation.set(
                Math.random() * 0.4,
                Math.random() * Math.PI * 2,
                Math.random() * 0.4
            );

            monolith.userData = {
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.2,
                    y: (Math.random() - 0.5) * 0.3,
                    z: (Math.random() - 0.5) * 0.2,
                },
                floatSpeed: 0.3 + Math.random() * 0.7,
                floatOffset: Math.random() * Math.PI * 2,
                baseY: monolith.position.y,
            };

            this.scene.add(monolith);
            this.monoliths.push(monolith);
        }

        // Start animation loop
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();

            // Camera orbit
            const radius = 16;
            this.camera.position.x = Math.sin(elapsed * 0.06) * radius;
            this.camera.position.z = Math.cos(elapsed * 0.06) * radius;
            this.camera.lookAt(0, 0, 0);

            // Float and spin monoliths
            this.monoliths.forEach((m) => {
                const ud = m.userData;
                m.rotation.x += ud.rotSpeed.x * 0.01;
                m.rotation.y += ud.rotSpeed.y * 0.01;
                m.rotation.z += ud.rotSpeed.z * 0.01;
                m.position.y = ud.baseY + Math.sin(elapsed * ud.floatSpeed + ud.floatOffset) * 0.5;
            });

            this.renderer.render(this.scene, this.camera);
        };
        animate();

        return true;
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
        this._updateCanvasPosition();
        if (!this.camera || !this.renderer || !this.container) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (!width || !height) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    destroy() {
        this.isDestroyed = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this._boundResize);
        window.removeEventListener('scroll', this._boundUpdatePosition);

        this.monoliths.forEach((m) => {
            if (m.geometry) m.geometry.dispose();
            if (m.material) m.material.dispose();
        });

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
