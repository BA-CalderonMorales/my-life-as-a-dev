/**
 * Neon Geode Scene
 *
 * Sharp crystal formations on a dark/synthwave base.
 * Neon pink, cyan, and purple crystals pulse with emissive glow
 * on a glossy black floor. Camera slowly orbits the geode.
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
        this.clock = new THREE.Clock();

        this.crystals = [];
        this.lights = [];
        this._boundUpdatePosition = this._updateCanvasPosition.bind(this);
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        this.isEmbedded = Boolean(this.container);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }
        this._updateCanvasPosition();
        window.addEventListener('resize', this._boundUpdatePosition);
        window.addEventListener('scroll', this._boundUpdatePosition);

        const isMobile = window.innerWidth < 768;
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
        const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.FogExp2(0x050510, 0.035);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 4, 12);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: !isMobile,
            alpha: false,
            powerPreference: isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // Floor
        const floorGeo = new THREE.PlaneGeometry(60, 60);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.9,
            roughness: 0.1,
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        this.scene.add(floor);

        // Ambient light
        const ambient = new THREE.AmbientLight(0x111122, 0.4);
        this.scene.add(ambient);

        // Neon colors
        const neonColors = [0xff00aa, 0x00ffff, 0xaa00ff];
        const emissiveColors = [0xff00aa, 0x00ffff, 0xaa00ff];

        // Create crystals
        const crystalCount = isMobile ? 12 : 20;
        for (let i = 0; i < crystalCount; i++) {
            const colorIdx = Math.floor(Math.random() * neonColors.length);
            const height = 1.5 + Math.random() * 3.5;
            const radius = 0.15 + Math.random() * 0.35;
            const geo = new THREE.ConeGeometry(radius, height, 4);
            const mat = new THREE.MeshStandardMaterial({
                color: neonColors[colorIdx],
                emissive: emissiveColors[colorIdx],
                emissiveIntensity: 0.8 + Math.random() * 1.2,
                metalness: 0.3,
                roughness: 0.2,
            });
            const crystal = new THREE.Mesh(geo, mat);

            const angle = Math.random() * Math.PI * 2;
            const dist = 1 + Math.random() * 6;
            crystal.position.set(
                Math.cos(angle) * dist,
                -2 + height / 2,
                Math.sin(angle) * dist
            );
            crystal.rotation.y = Math.random() * Math.PI;
            crystal.rotation.z = (Math.random() - 0.5) * 0.3;

            crystal.userData = {
                baseEmissive: mat.emissiveIntensity,
                pulseSpeed: 0.5 + Math.random() * 1.5,
                pulseOffset: Math.random() * Math.PI * 2,
            };

            this.scene.add(crystal);
            this.crystals.push(crystal);

            // Add point light inside a few crystals for glow
            if (i % 4 === 0 && !isMobile) {
                const pl = new THREE.PointLight(neonColors[colorIdx], 2, 8);
                pl.position.copy(crystal.position);
                pl.position.y += height * 0.2;
                this.scene.add(pl);
                this.lights.push(pl);
            }
        }

        // Start animation loop
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();

            // Orbit camera
            const camRadius = 12;
            this.camera.position.x = Math.sin(elapsed * 0.1) * camRadius;
            this.camera.position.z = Math.cos(elapsed * 0.1) * camRadius;
            this.camera.lookAt(0, 1, 0);

            // Pulse crystals
            this.crystals.forEach((crystal) => {
                const ud = crystal.userData;
                const pulse = Math.sin(elapsed * ud.pulseSpeed + ud.pulseOffset);
                crystal.material.emissiveIntensity = ud.baseEmissive + pulse * 0.3;
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

    destroy() {
        this.isDestroyed = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this._boundUpdatePosition);
        window.removeEventListener('scroll', this._boundUpdatePosition);

        this.crystals.forEach((c) => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
        });
        this.lights.forEach((l) => {
            if (l.parent) l.parent.remove(l);
        });

        if (this.renderer) this.renderer.dispose();
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
