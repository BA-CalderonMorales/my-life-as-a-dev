/**
 * Smoke Mirrors View - Passive Three.js Layer
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
        this.mirrors = [];
    }

    init(config) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(config.colors.background);
        this.scene.fog = new THREE.FogExp2(config.colors.background, 0.015);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 15);

        const perf = this.isMobile ? config.performance.mobile : config.performance.desktop;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this._createLights();
    }

    _createLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        const point = new THREE.PointLight(0xffffff, 1, 50);
        point.position.set(0, 5, 5);
        this.scene.add(ambient, point);
    }

    createParticles(count, size, colors) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            pos[idx] = (Math.random() - 0.5) * 24;
            pos[idx + 1] = (Math.random() - 0.5) * 16;
            pos[idx + 2] = (Math.random() - 0.5) * 8;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: colors.smoke,
            size: size,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
        return pos;
    }

    createMirrors(positions, color) {
        const shapes = [
            new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16),
            new THREE.IcosahedronGeometry(1.8, 0),
            new THREE.OctahedronGeometry(1.5, 0),
        ];

        shapes.forEach((geo, i) => {
            const mat = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 1.0,
                roughness: 0.1,
            });
            const mesh = new THREE.Mesh(geo, mat);
            const p = positions[i % positions.length];
            mesh.position.set(p.x, p.y, p.z);
            this.scene.add(mesh);
            this.mirrors.push(mesh);
        });
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
        this.mirrors.forEach(m => {
            m.geometry.dispose();
            m.material.dispose();
        });
    }
}
