/**
 * Quantum Lattice View - Passive Three.js Layer
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile, isTablet) {
        this.container = container;
        this.isMobile = isMobile;
        this.isTablet = isTablet;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.nodes = null;
        this.lines = null;
    }

    init(colors, config) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fogColor, colors.fogNear, colors.fogFar);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 15);

        const perf = this.isMobile ? config.performance.mobile : (this.isTablet ? config.performance.tablet : config.performance.desktop);

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    createLattice(gridSize, octaSize, count, colors) {
        const nodeGeo = new THREE.OctahedronGeometry(octaSize, 0);
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

        // Lines
        const lineGeo = new THREE.BufferGeometry();
        const linePos = new Float32Array(count * 6); // Over-allocated but safe
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
        lineGeo.attributes.position.setUsage(THREE.DynamicDrawUsage);

        const lineMat = new THREE.LineBasicMaterial({
            color: colors.lineColor,
            transparent: true,
            opacity: colors.lineOpacity
        });

        this.lines = new THREE.LineSegments(lineGeo, lineMat);
        this.scene.add(this.lines);

        return {
            nodeMatrices: this.nodes.instanceMatrix.array,
            linePositions: this.lines.geometry.attributes.position.array
        };
    }

    updateTheme(colors) {
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.nodes.material.color.setHex(colors.nodeColor);
        this.nodes.material.emissive.setHex(colors.glowColor);
        this.lines.material.color.setHex(colors.lineColor);
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
        this.nodes.geometry.dispose();
        this.nodes.material.dispose();
        this.lines.geometry.dispose();
        this.lines.material.dispose();
    }
}
