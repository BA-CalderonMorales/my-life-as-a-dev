/**
 * Digital Rain View - Passive Three.js Stage
 *
 * This file contains zero logic. It only provides the Three.js primitives
 * and rendering pipeline.
 */
import * as THREE from 'three';

export class View {
    constructor(container, isMobile) {
        this.container = container;
        this.isMobile = isMobile;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Passive refs to Three.js objects
        this.particles = null;
        this.floor = null;
    }

    init(colors) {
        const { clientWidth: w, clientHeight: h } = this.container;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.01);

        this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        this.camera.position.set(0, -5, 25);
        this.camera.lookAt(0, 2, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * Create a Points object with provided data buffers.
     * ZERO logic here, just buffer assignment.
     */
    addParticles(positions, colors, size) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: size,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    /**
     * Add a simple floor plane.
     */
    addFloor(color) {
        const geo = new THREE.PlaneGeometry(40, 40);
        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
        });
        this.floor = new THREE.Mesh(geo, mat);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.y = -12;
        this.scene.add(this.floor);
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
