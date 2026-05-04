/**
 * Holographic Sand View - Three.js Rendering
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.grid = null;
    }

    init(config) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(config.colors.background);
        this.scene.fog = new THREE.FogExp2(config.colors.background, 0.012);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 15);

        const perf = this.isMobile ? config.performance.mobile : config.performance.desktop;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this._createParticles(config, perf.particleCount);
        this._createGrid(config);
    }

    _createParticles(config, count) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        
        // Initial random burst
        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            positions[idx] = (Math.random() - 0.5) * 20;
            positions[idx + 1] = (Math.random() - 0.5) * 14;
            positions[idx + 2] = (Math.random() - 0.5) * 10;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: config.colors.sand,
            size: this.isMobile ? config.performance.mobile.size : config.performance.desktop.size,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    _createGrid(config) {
        this.grid = new THREE.GridHelper(40, 40, config.colors.grid, config.colors.gridSub);
        this.grid.position.y = -10;
        this.grid.rotation.x = Math.PI * 0.05; // Slight tilt for depth
        this.scene.add(this.grid);
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
        if (this.particles) this.particles.geometry.dispose();
    }
}
