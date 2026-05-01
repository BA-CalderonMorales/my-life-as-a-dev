/**
 * Bismuth Fracture Scene
 *
 * Stepped rainbow staircases resembling bismuth crystals.
 * Each stack has 4-8 progressively smaller steps with HSL rainbow coloring.
 */
import * as THREE from 'three';

export class BismuthFractureScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.clock = new THREE.Clock();

        this.stacks = [];
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
        this.scene.background = new THREE.Color(0x080808);
        this.scene.fog = new THREE.FogExp2(0x080808, 0.025);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 5, 14);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: !isMobile,
            alpha: false,
            powerPreference: isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambient = new THREE.AmbientLight(0x333333, 0.6);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xffaa77, 0.8, 20);
        pointLight.position.set(-5, 4, -5);
        this.scene.add(pointLight);

        // Create bismuth stacks
        const stackCount = isMobile ? 10 : 18;
        const stepsMin = 4;
        const stepsMax = 8;

        for (let s = 0; s < stackCount; s++) {
            const stackGroup = new THREE.Group();
            const steps = stepsMin + Math.floor(Math.random() * (stepsMax - stepsMin + 1));
            const baseSize = 1.2 + Math.random() * 1.0;
            const stackHue = (s / stackCount) % 1.0;

            for (let step = 0; step < steps; step++) {
                const stepScale = 1.0 - (step / steps) * 0.7;
                const w = baseSize * stepScale;
                const h = 0.15 + Math.random() * 0.15;
                const d = baseSize * stepScale;

                const geo = new THREE.BoxGeometry(w, h, d);
                const hue = (stackHue + step * 0.08) % 1.0;
                const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
                const mat = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.8,
                    roughness: 0.2,
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.y = step * 0.25;
                mesh.rotation.y = step * 0.15;
                stackGroup.add(mesh);
            }

            const angle = (s / stackCount) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 2 + Math.random() * 6;
            stackGroup.position.set(
                Math.cos(angle) * dist,
                -2,
                Math.sin(angle) * dist
            );
            stackGroup.rotation.y = Math.random() * Math.PI * 2;

            stackGroup.userData = {
                rotSpeed: (Math.random() - 0.5) * 0.4,
            };

            this.scene.add(stackGroup);
            this.stacks.push(stackGroup);
        }

        // Start animation loop
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();

            // Camera orbit
            const radius = 14;
            this.camera.position.x = Math.sin(elapsed * 0.07) * radius;
            this.camera.position.z = Math.cos(elapsed * 0.07) * radius;
            this.camera.lookAt(0, 1.5, 0);

            // Rotate stacks
            this.stacks.forEach((stack) => {
                stack.rotation.y += stack.userData.rotSpeed * 0.01;
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

        this.stacks.forEach((stack) => {
            stack.children.forEach((mesh) => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
            });
        });

        if (this.renderer) this.renderer.dispose();
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
