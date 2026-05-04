/**
 * Solar Flare View - Passive Three.js Layer
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.sun = null;
        this.sunGlow = null;
    }

    init(config) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(config.colors.background);
        this.scene.fog = new THREE.FogExp2(config.colors.background, 0.008);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        this.camera.position.z = 15;

        const perf = this.isMobile ? config.performance.mobile : config.performance.desktop;

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this._createSun(config.colors);
    }

    _createSun(colors) {
        const sunGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: colors.sun });
        this.sun = new THREE.Mesh(sunGeo, sunMat);
        this.scene.add(this.sun);

        const glowGeo = new THREE.SphereGeometry(1.6, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: colors.glow,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.sunGlow = new THREE.Mesh(glowGeo, glowMat);
        this.scene.add(this.sunGlow);
    }

    createParticles(count, size) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const mat = new THREE.PointsMaterial({
            size: size,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
        return { positions: pos, colors: col };
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
        this.particles.geometry.dispose();
        this.particles.material.dispose();
        this.sun.geometry.dispose();
        this.sun.material.dispose();
        this.sunGlow.geometry.dispose();
        this.sunGlow.material.dispose();
    }
}
