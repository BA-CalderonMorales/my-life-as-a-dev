/**
 * Zen Geometry View - Passive Three.js Stage
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
        this.centralForm = null;
        this.nodes = null;
        this.connections = [];
        this.ambientLight = null;
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.009);

        this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        this.camera.position.z = perf.camDistance;

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight(colors.ambientLight, 0.5);
        this.scene.add(this.ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
        keyLight.position.set(5, 10, 7);
        this.scene.add(keyLight);
    }

    addCentralForm(size, colors) {
        const icoGeo = new THREE.IcosahedronGeometry(size, 1);
        const icoMat = new THREE.MeshPhysicalMaterial({
            color: colors.centralColor,
            metalness: 0.04,
            roughness: 0.56,
            transmission: 0.18,
            transparent: true,
            opacity: 0.94,
            emissive: colors.glowColor,
            emissiveIntensity: 0.014,
        });
        this.centralForm = new THREE.Mesh(icoGeo, icoMat);
        this.scene.add(this.centralForm);
    }

    addInstancedNodes(count, colors) {
        const nodeGeo = new THREE.OctahedronGeometry(1, 0);
        const nodeMat = new THREE.MeshPhysicalMaterial({
            color: colors.nodeColor,
            metalness: 0.02,
            roughness: 0.72,
            emissive: colors.glowColor,
            emissiveIntensity: 0.03,
        });
        this.nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, count);
        this.nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.nodes);
    }

    addConnections(count, color) {
        const lineMat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.08,
        });

        for (let i = 0; i < count; i++) {
            const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
            const line = new THREE.Line(geo, lineMat.clone());
            this.scene.add(line);
            this.connections.push(line);
        }
    }

    updateTheme(colors) {
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.background);
        this.ambientLight.color.setHex(colors.ambientLight);
        this.centralForm.material.color.setHex(colors.centralColor);
        this.centralForm.material.emissive.setHex(colors.glowColor);
        this.nodes.material.color.setHex(colors.nodeColor);
        this.nodes.material.emissive.setHex(colors.glowColor);
        this.connections.forEach(line => line.material.color.setHex(colors.lineColor));
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
