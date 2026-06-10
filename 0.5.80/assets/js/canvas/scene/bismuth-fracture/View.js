/**
 * Bismuth Fracture View - Passive Three.js Stage
 *
 * This file contains zero logic. It only handles object instantiation
 * and the rendering pipeline.
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.instancedMesh = null;
    }

    init(colors) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.025);

        this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        this.camera.position.set(0, 5, 14);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        this._setupLighting(colors);
    }

    _setupLighting(colors) {
        this.scene.add(new THREE.AmbientLight(colors.ambient, 0.6));
        const dirLight = new THREE.DirectionalLight(colors.directional, 1.0);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);
    }

    /**
     * Set up the InstancedMesh with zero logic.
     * ViewModel provides the total count.
     */
    addInstancedMesh(count) {
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshStandardMaterial({
            metalness: 0.8,
            roughness: 0.2,
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
