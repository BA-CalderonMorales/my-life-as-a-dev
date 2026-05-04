/**
 * Loom View - Passive Three.js Layer
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.threads = [];
    }

    init(config, colors) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.015);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        this.camera.position.z = 12;

        const perf = this.isMobile ? config.performance.mobile : config.performance.desktop;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    createThreads(type, count, segments, spacing, color, opacity) {
        const isHorizontal = type === 'horizontal';
        const extent = (count - 1) * spacing / 2;
        const mat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });

        for (let i = 0; i < count; i++) {
            const fixed = (i * spacing) - extent;
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array((segments + 1) * 3);
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.attributes.position.setUsage(THREE.DynamicDrawUsage);

            const line = new THREE.Line(geo, mat.clone());
            this.scene.add(line);
            this.threads.push({ line, type, fixed, segments, extent });
        }
    }

    updateTheme(colors) {
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.background);
        this.threads.forEach(t => {
            t.line.material.color.setHex(t.type === 'horizontal' ? colors.lineColor : colors.nodeColor);
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
        this.threads.forEach(t => {
            t.line.geometry.dispose();
            t.line.material.dispose();
        });
    }
}
