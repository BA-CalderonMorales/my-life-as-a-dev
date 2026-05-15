/**
 * Origami Unfolding View - Passive Three.js Stage
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
        this.planes = [];
        this.connections = [];
        this.ambientLight = null;
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fog, 5, 25);

        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        this.camera.position.set(0, 0, 12);

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight(colors.ambient, 0.6);
        this.scene.add(this.ambientLight);
    }

    addPlanes(count, size, colors) {
        const geo = new THREE.BufferGeometry();
        const half = size / 2;
        const vertices = new Float32Array([
            0, half, 0,
            -half, -half, 0,
            half, -half, 0,
        ]);
        geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geo.computeVertexNormals();

        const mat = new THREE.MeshPhysicalMaterial({
            color: colors.plane,
            metalness: 0.1,
            roughness: 0.5,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            emissive: colors.glow,
            emissiveIntensity: 0.05
        });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geo, mat.clone());
            this.scene.add(mesh);
            this.planes.push(mesh);
        }
    }

    addConnections(indices, color) {
        const lineMat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15
        });

        indices.forEach(() => {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
            const line = new THREE.Line(lineGeo, lineMat.clone());
            this.scene.add(line);
            this.connections.push(line);
        });
    }

    updateTheme(colors) {
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fog);
        this.ambientLight.color.setHex(colors.ambient);
        this.planes.forEach(p => {
            p.material.color.setHex(colors.plane);
            p.material.emissive.setHex(colors.glow);
        });
        this.connections.forEach(l => l.material.color.setHex(colors.line));
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
        this.planes.forEach(p => p.geometry.dispose());
        this.connections.forEach(l => l.geometry.dispose());
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
