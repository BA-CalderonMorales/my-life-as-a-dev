/**
 * Loom View - Passive Three.js Stage
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
        this.threads = [];
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.015);

        this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        this.camera.position.z = 12;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    addThread(type, fixed, segments, extent, color, opacity) {
        const mat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });

        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array((segments + 1) * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.attributes.position.setUsage(THREE.DynamicDrawUsage);

        const line = new THREE.Line(geo, mat);
        this.scene.add(line);
        
        const thread = { line, type, fixed, segments, extent };
        this.threads.push(thread);
        return thread;
    }

    updateTheme(colors) {
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.background);
        this.threads.forEach(t => {
            t.line.material.color.setHex(t.type === 'horizontal' ? colors.lineColor : colors.nodeColor);
        });
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
        this.threads.forEach(t => {
            t.line.geometry.dispose();
            t.line.material.dispose();
        });
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
