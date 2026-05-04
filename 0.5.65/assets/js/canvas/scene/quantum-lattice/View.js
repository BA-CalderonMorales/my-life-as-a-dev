/**
 * Quantum Lattice View - Passive Three.js Stage
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
        this.nodes = null;
        this.lines = null;
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fogColor, colors.fogNear, colors.fogFar);

        this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        this.camera.position.set(0, 0, 15);

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    addInstancedNodes(count, size, colors) {
        const nodeGeo = new THREE.OctahedronGeometry(size, 0);
        const nodeMat = new THREE.MeshPhysicalMaterial({
            color: colors.nodeColor,
            metalness: 0.1,
            roughness: 0.5,
            emissive: colors.glowColor,
            emissiveIntensity: colors.emissiveBase
        });

        this.nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, count);
        this.nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.nodes);
    }

    addLines(count, color, opacity) {
        const lineGeo = new THREE.BufferGeometry();
        const linePos = new Float32Array(count * 6);
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
        lineGeo.attributes.position.setUsage(THREE.DynamicDrawUsage);

        const lineMat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });

        this.lines = new THREE.LineSegments(lineGeo, lineMat);
        this.scene.add(this.lines);
    }

    updateTheme(colors) {
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.nodes.material.color.setHex(colors.nodeColor);
        this.nodes.material.emissive.setHex(colors.glowColor);
        this.lines.material.color.setHex(colors.lineColor);
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
        if (this.nodes) { this.nodes.geometry.dispose(); this.nodes.material.dispose(); }
        if (this.lines) { this.lines.geometry.dispose(); this.lines.material.dispose(); }
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
