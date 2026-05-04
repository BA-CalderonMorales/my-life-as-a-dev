/**
 * Tidal Pool View - Passive Three.js Layer
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
    }

    init(config, colors) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(config.colors.background);
        this.scene.fog = new THREE.FogExp2(config.colors.background, 0.02);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        this.camera.position.z = 20;

        const perf = this.isMobile ? config.performance.mobile : config.performance.desktop;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    createParticles(count, size, baseCol) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * 14;
            pos[idx] = Math.cos(angle) * radius;
            pos[idx + 1] = Math.sin(angle) * radius;
            pos[idx + 2] = 0;

            const t = Math.random();
            col[idx] = baseCol[0];
            col[idx + 1] = baseCol[1] + t * 0.2;
            col[idx + 2] = baseCol[2] + t * 0.2;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const mat = new THREE.PointsMaterial({
            size: size,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
        return { positions: pos, colors: col };
    }

    onResize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.renderer.dispose();
        this.particles.geometry.dispose();
        this.particles.material.dispose();
    }
}
