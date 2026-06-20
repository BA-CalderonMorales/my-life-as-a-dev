/**
 * Obsidian Shards View - Passive Three.js Stage
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
        this.instancedMesh = null;
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.015);

        this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
        this.camera.position.set(0, 3, perf.camDist);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        this._createEnvironment(colors);
    }

    _createEnvironment(colors) {
        const grid = new THREE.GridHelper(40, 40, colors.ambient, colors.ambient);
        grid.position.y = -4;
        this.scene.add(grid);

        this.scene.add(new THREE.AmbientLight(colors.ambient, 0.4));
    }

    addPointLights(positions, colors) {
        positions.forEach((pos, i) => {
            const pl = new THREE.PointLight(colors[i % colors.length], 2, 20);
            pl.position.set(...pos);
            this.scene.add(pl);
        });
    }

    addInstancedShards(count, colors) {
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshPhysicalMaterial({
            color: colors.obsidian,
            metalness: 1.0,
            roughness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
        });

        this.instancedMesh = new THREE.InstancedMesh(boxGeo, boxMat, count);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.instancedMesh);
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
