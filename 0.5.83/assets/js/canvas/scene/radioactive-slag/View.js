/**
 * Radioactive Slag View - Passive Three.js Stage
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
        this.rocks = [];
        this.lights = [];
    }

    init(colors) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.03);

        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 80);
        this.camera.position.set(0, 2, 12);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(colors.ambient, 0.3));

        // Create cave shell
        const caveGeo = new THREE.SphereGeometry(25, 32, 32);
        const caveMat = new THREE.MeshStandardMaterial({
            color: colors.cave,
            metalness: 0.8,
            roughness: 0.6,
            side: THREE.BackSide,
        });
        this.scene.add(new THREE.Mesh(caveGeo, caveMat));
    }

    addPointLight(color) {
        const pl = new THREE.PointLight(color, 2, 12);
        this.scene.add(pl);
        this.lights.push(pl);
        return pl;
    }

    addRock(radius, colors) {
        const geo = new THREE.DodecahedronGeometry(radius, 0);
        const mat = new THREE.MeshStandardMaterial({
            color: colors.rock,
            emissive: colors.glow,
            emissiveIntensity: 1.0,
            metalness: 0.4,
            roughness: 0.7,
        });
        const rock = new THREE.Mesh(geo, mat);
        this.scene.add(rock);
        this.rocks.push(rock);
        return rock;
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
        this.scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        });
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
