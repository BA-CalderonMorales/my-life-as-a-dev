/**
 * Magnetic Dust ViewModel - Core Behavioral Logic
 */
import * as THREE from 'three';
import { MAGNETIC_DUST_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = MAGNETIC_DUST_CONFIG;
        this.isMobile = isMobile;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.count = perf.particleCount;
        this.particleSize = perf.size;

        this.positions = new Float32Array(this.count * 3);
        this.mouse3D = new THREE.Vector3(0, 0, 0);
        this.isInteracting = false;
        
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.startTime = performance.now();
    }

    init() {
        const bounds = this.config.bounds;
        // Behavior: Initial randomized positioning
        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            this.positions[idx] = (Math.random() - 0.5) * bounds.x * 2;
            this.positions[idx + 1] = (Math.random() - 0.5) * bounds.y * 2;
            this.positions[idx + 2] = (Math.random() - 0.5) * bounds.z * 2;
        }

        const colors = { background: this.config.colors.background };
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        
        this.view.init(colors, perf);
        this.view.addParticles(this.positions, this.config.colors.dust, this.particleSize);
    }

    handleMouseMove(x, y) {
        this.isInteracting = true;
        this.raycaster.setFromCamera({ x, y }, this.view.camera);
        this.raycaster.ray.intersectPlane(this.plane, this.mouse3D);
    }

    handleInteractionEnd() {
        this.isInteracting = false;
    }

    update() {
        const dt = 0.016;
        const cfg = this.config;
        const positions = this.view.particles.geometry.attributes.position.array;

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            let px = positions[idx];
            let py = positions[idx + 1];
            let pz = positions[idx + 2];

            // Behavior: Field drift physics
            px += Math.cos(py * cfg.physics.fieldScale) * dt;
            py += Math.sin(px * (cfg.physics.fieldScale + 0.1)) * dt;
            
            // Behavior: Brownian jitter
            px += (Math.random() - 0.5) * cfg.physics.noiseAmount;
            py += (Math.random() - 0.5) * cfg.physics.noiseAmount;
            pz += (Math.random() - 0.5) * cfg.physics.noiseAmount;

            // Behavior: Magnetic attraction
            if (this.isInteracting) {
                const dx = this.mouse3D.x - px;
                const dy = this.mouse3D.y - py;
                const dz = this.mouse3D.z - pz;
                const dSq = dx*dx + dy*dy + dz*dz;
                
                if (dSq < cfg.physics.magnetRadiusSq) {
                    const d = Math.sqrt(dSq) + 0.1;
                    const f = (Math.sqrt(cfg.physics.magnetRadiusSq) - d) * cfg.physics.magnetForce;
                    px += (dx / d) * f;
                    py += (dy / d) * f;
                    pz += (dz / d) * f;
                }
            }

            // Behavior: Wrapping bounds
            if (px > cfg.bounds.x) px -= cfg.bounds.x * 2;
            if (px < -cfg.bounds.x) px += cfg.bounds.x * 2;
            if (py > cfg.bounds.y) py -= cfg.bounds.y * 2;
            if (py < -cfg.bounds.y) py += cfg.bounds.y * 2;
            if (pz > cfg.bounds.z) pz -= cfg.bounds.z * 2;
            if (pz < -cfg.bounds.z) pz += cfg.bounds.z * 2;

            positions[idx] = px;
            positions[idx + 1] = py;
            positions[idx + 2] = pz;
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;
        this.view.render();
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
