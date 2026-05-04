/**
 * Smoke Mirrors View - Passive Three.js Stage
 * 
 * ZERO logic. Only handles object instantiation and rendering.
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Passive refs
        this.particles = null;
        this.mirrors = [];
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.015);

        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
        this.camera.position.set(0, 0, 15);

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(w, h);
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

    addParticles(positions, size, color) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const mat = new THREE.PointsMaterial({
            color: color,
            size: size,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    }

    addMirrors(positions, color) {
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
        const { clientWidth: w, clientHeight: h } = this.container;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.renderer.dispose();
        if (this.particles) { this.particles.geometry.dispose(); this.particles.material.dispose(); }
        this.mirrors.forEach(m => {
            m.geometry.dispose();
            m.material.dispose();
        });
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
