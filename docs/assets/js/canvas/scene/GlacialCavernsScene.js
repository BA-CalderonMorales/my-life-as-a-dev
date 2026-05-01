/**
 * Glacial Caverns Scene
 *
 * Translucent ice-like blocks drift and rotate in a deep blue cavern.
 * MeshPhysicalMaterial simulates ice with transmission, thickness, and IOR.
 */
import * as THREE from 'three';

export class GlacialCavernsScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.clock = new THREE.Clock();

        this.iceBlocks = [];
        this.lights = [];
        this._boundUpdatePosition = this._updateCanvasPosition.bind(this);
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        const isEmbedded = Boolean(this.container);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }
        this._updateCanvasPosition();
        window.addEventListener('resize', this._boundUpdatePosition);
        window.addEventListener('scroll', this._boundUpdatePosition);

        const isMobile = window.innerWidth < 768;
        const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000818);
        this.scene.fog = new THREE.FogExp2(0x000818, 0.02);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            55,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            80
        );
        this.camera.position.set(0, 2, 14);

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

        // Ambient
        const ambient = new THREE.AmbientLight(0x223344, 0.5);
        this.scene.add(ambient);

        // Internal blue point lights
        const lightPositions = [
            [5, 3, 4], [-5, -1, 3], [0, 5, -4], [3, -3, -5], [-4, 2, -3]
        ];
        lightPositions.forEach((pos) => {
            const pl = new THREE.PointLight(0x44aaff, 3, 18);
            pl.position.set(...pos);
            this.scene.add(pl);
            this.lights.push(pl);
        });

        // Ice blocks
        const blockCount = isMobile ? 15 : 25;
        const iceColors = [0xaaddff, 0xffffff, 0x88ccff];

        for (let i = 0; i < blockCount; i++) {
            const sx = 0.6 + Math.random() * 1.4;
            const sy = 0.6 + Math.random() * 1.4;
            const sz = 0.6 + Math.random() * 1.4;
            const geo = new THREE.BoxGeometry(sx, sy, sz);
            const color = iceColors[Math.floor(Math.random() * iceColors.length)];
            const mat = new THREE.MeshPhysicalMaterial({
                color: color,
                transmission: 0.6,
                thickness: 2.0,
                ior: 1.31,
                roughness: 0.15,
                metalness: 0.0,
                transparent: true,
                opacity: 0.85,
            });
            const block = new THREE.Mesh(geo, mat);

            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 8;
            block.position.set(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 6,
                Math.sin(angle) * dist
            );
            block.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            block.userData = {
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.3,
                    y: (Math.random() - 0.5) * 0.3,
                    z: (Math.random() - 0.5) * 0.3,
                },
                driftSpeed: {
                    x: (Math.random() - 0.5) * 0.2,
                    y: (Math.random() - 0.5) * 0.15,
                    z: (Math.random() - 0.5) * 0.2,
                },
                initialPos: block.position.clone(),
            };

            this.scene.add(block);
            this.iceBlocks.push(block);
        }

        // Start animation loop
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();
            const delta = this.clock.getDelta();

            // Gentle camera drift
            this.camera.position.x = Math.sin(elapsed * 0.08) * 14;
            this.camera.position.z = Math.cos(elapsed * 0.08) * 14;
            this.camera.lookAt(0, 0, 0);

            // Rotate and drift blocks
            this.iceBlocks.forEach((block) => {
                const ud = block.userData;
                block.rotation.x += ud.rotSpeed.x * 0.01;
                block.rotation.y += ud.rotSpeed.y * 0.01;
                block.rotation.z += ud.rotSpeed.z * 0.01;

                block.position.x = ud.initialPos.x + Math.sin(elapsed * 0.2 + ud.initialPos.z) * 0.5;
                block.position.y = ud.initialPos.y + Math.cos(elapsed * 0.15 + ud.initialPos.x) * 0.4;
                block.position.z = ud.initialPos.z + Math.sin(elapsed * 0.25 + ud.initialPos.y) * 0.5;
            });

            this.renderer.render(this.scene, this.camera);
        };
        animate();

        return true;
    }

    _updateCanvasPosition() {
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

        this.iceBlocks.forEach((b) => {
            if (b.geometry) b.geometry.dispose();
            if (b.material) b.material.dispose();
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
