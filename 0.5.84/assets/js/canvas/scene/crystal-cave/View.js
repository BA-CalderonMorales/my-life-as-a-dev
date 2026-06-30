/**
 * Crystal Cave View - Passive Three.js Stage
 * 
 * Solely responsible for rendering html to a particular location
 * and providing the Three.js primitives. Contains ZERO logic.
 */
import * as THREE from 'three';

export class View {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
    }

    /**
     * Set up the Three.js stage with minimal boilerplate.
     */
    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fogColor, colors.fogNear, colors.fogFar);

        this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: perf.antialias,
            alpha: false,
            powerPreference: perf.powerPreference
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = colors.toneMappingExposure;
        
        this.canvas = this.renderer.domElement;
        this.container.appendChild(this.canvas);
    }

    /**
     * Simple declarative additions to the scene.
     */
    addToScene(object) {
        this.scene.add(object);
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
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
    }
}
