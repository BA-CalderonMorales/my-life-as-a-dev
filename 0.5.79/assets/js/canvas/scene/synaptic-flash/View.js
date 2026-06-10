/**
 * Synaptic Flash View - Passive Three.js Stage
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
        this.nodes = [];
        this.connections = [];
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fogColor, 5, 25);

        this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        this.camera.position.z = 15;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(colors.ambientLight, 0.5));
    }

    addNodes(count, size, colors) {
        const geo = new THREE.SphereGeometry(size, 12, 12);
        const mat = new THREE.MeshPhysicalMaterial({
            color: colors.nodeColor,
            metalness: 0.1,
            roughness: 0.5,
            emissive: colors.glowColor,
            emissiveIntensity: 0.1
        });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geo, mat.clone());
            this.scene.add(mesh);
            this.nodes.push(mesh);
        }
    }

    addConnections(count, color, opacity) {
        const mat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });

        for (let i = 0; i < count; i++) {
            const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
            const line = new THREE.Line(geo, mat.clone());
            this.scene.add(line);
            this.connections.push(line);
        }
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
        this.nodes.forEach(n => { n.geometry.dispose(); n.material.dispose(); });
        this.connections.forEach(c => { c.geometry.dispose(); c.material.dispose(); });
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
