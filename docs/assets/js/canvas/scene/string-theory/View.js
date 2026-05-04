/**
 * String Theory View - Passive Three.js Stage
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
        this.strings = [];
    }

    init(colors, perf) {
        const { clientWidth: w, clientHeight: h } = this.container;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, this.isMobile ? 0.018 : 0.014);

        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
        this.camera.position.z = 15;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    addStrings(count, color, opacity) {
        for (let i = 0; i < count; i++) {
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(6); 
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.attributes.position.setUsage(THREE.DynamicDrawUsage);

            const mat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: opacity
            });
            const line = new THREE.Line(geo, mat);
            this.scene.add(line);
            this.strings.push(line);
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
        this.strings.forEach(s => {
            s.geometry.dispose();
            s.material.dispose();
        });
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
