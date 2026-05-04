/**
 * Particle Flow ViewModel - Core Behavioral Logic
 * 
 * Orchestrates field drift physics, organic noise jitter,
 * and interactive "push" forces.
 */
import * as THREE from 'three';
import { PARTICLE_FLOW_CONFIG, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = PARTICLE_FLOW_CONFIG;
        this.isMobile = isMobile;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.count = perf.particleCount;
        this.particleSize = perf.size;

        this.positions = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);
        
        this.startTime = performance.now();
        this.mouse3D = new THREE.Vector3(0, 0, 0);
        this.isInteracting = false;
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    init() {
        const colors = getColors();
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        // Behavior: Initial randomized particle placement and color blending
        const pCol = new THREE.Color(this.config.colors.particle);
        const aCol = new THREE.Color(this.config.colors.accent);

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            this.positions[idx] = (Math.random() - 0.5) * 32;
            this.positions[idx + 1] = (Math.random() - 0.5) * 18;
            this.positions[idx + 2] = (Math.random() - 0.5) * 8;

            const mix = 0.12 + Math.random() * 0.28;
            const color = pCol.clone().lerp(aCol, mix);
            this.colors[idx] = color.r;
            this.colors[idx + 1] = color.g;
            this.colors[idx + 2] = color.b;
        }

        this.view.init(colors, perf);
        this.view.addParticles(this.positions, this.colors, this.particleSize);
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
        const cfg = this.config.physics;
        const pos = this.view.particles.geometry.attributes.position.array;

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            let px = pos[idx];
            let py = pos[idx + 1];
            let pz = pos[idx + 2];

            // Behavior: Organic field drift physics
            px += Math.sin(py * cfg.fieldScale) * cfg.driftSpeed;
            py += Math.cos(px * cfg.fieldScale) * cfg.driftSpeed;
            
            // Behavior: Organic jitter
            px += (Math.random() - 0.5) * cfg.noiseAmount;
            py += (Math.random() - 0.5) * cfg.noiseAmount;

            // Behavior: Interactive push force
            if (this.isInteracting) {
                const dx = px - this.mouse3D.x;
                const dy = py - this.mouse3D.y;
                const dSq = dx*dx + dy*dy;
                if (dSq < cfg.pushRadiusSq) {
                    const d = Math.sqrt(dSq) + 0.1;
                    const f = (Math.sqrt(cfg.pushRadiusSq) - d) * cfg.pushForce;
                    px += (dx / d) * f;
                    py += (dy / d) * f;
                }
            }

            // Behavior: Wrap bounds logic
            if (px > 20) px -= 40;
            if (px < -20) px += 40;
            if (py > 12) py -= 24;
            if (py < -12) py += 24;

            pos[idx] = px;
            pos[idx + 1] = py;
            pos[idx + 2] = pz;
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
