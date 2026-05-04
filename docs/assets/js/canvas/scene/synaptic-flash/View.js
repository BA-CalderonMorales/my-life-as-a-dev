/**
 * Synaptic Flash View - Passive Three.js Layer
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.nodes = [];
        this.connections = [];
    }

    init(config, colors) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fogColor, 5, 25);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        this.camera.position.z = 15;

        const perf = this.isMobile ? config.performance.mobile : config.performance.desktop;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(colors.ambientLight, 0.5));
    }

    createNodes(positions, size, colors) {
        const geo = new THREE.SphereGeometry(size, 12, 12);
        const mat = new THREE.MeshPhysicalMaterial({
            color: colors.nodeColor,
            metalness: 0.1,
            roughness: 0.5,
            emissive: colors.glowColor,
            emissiveIntensity: 0.1
        });

        positions.forEach(pos => {
            const mesh = new THREE.Mesh(geo, mat.clone());
            mesh.position.copy(pos);
            this.scene.add(mesh);
            this.nodes.push(mesh);
        });
    }

    createConnections(edges, color, opacity) {
        const mat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });

        edges.forEach(edge => {
            const p1 = this.nodes[edge.from].position;
            const p2 = this.nodes[edge.to].position;
            const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            const line = new THREE.Line(geo, mat.clone());
            this.scene.add(line);
            this.connections.push(line);
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
        this.nodes.forEach(n => { n.geometry.dispose(); n.material.dispose(); });
        this.connections.forEach(c => { c.geometry.dispose(); c.material.dispose(); });
    }
}
