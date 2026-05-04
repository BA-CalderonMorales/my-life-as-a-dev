/**
 * String Theory View - Passive Three.js Layer
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.strings = [];
    }

    init(config, colors) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, this.isMobile ? 0.018 : 0.014);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        this.camera.position.z = 15;

        const perf = this.isMobile ? config.performance.mobile : config.performance.desktop;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    createStrings(count, length, color, opacity) {
        for (let i = 0; i < count; i++) {
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(6); // 2 points * 3 coords
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
        this.strings.forEach(s => {
            s.geometry.dispose();
            s.material.dispose();
        });
    }
}
