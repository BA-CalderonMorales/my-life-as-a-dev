/**
 * Tidal Pool ViewModel - Core Behavioral Logic
 * 
 * Orchestrates ripple interference physics and interactive ripple logic.
 */
import * as THREE from 'three';
import { TIDAL_POOL_CONFIG, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = TIDAL_POOL_CONFIG;
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

        // Behavior: Initial randomized circular particle distribution
        const baseCol = this.config.colors.teal;
        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * 14;
            
            this.positions[idx] = Math.cos(angle) * radius;
            this.positions[idx + 1] = Math.sin(angle) * radius;
            this.positions[idx + 2] = 0;

            const t = Math.random();
            this.colors[idx] = baseCol[0];
            this.colors[idx + 1] = baseCol[1] + t * 0.2;
            this.colors[idx + 2] = baseCol[2] + t * 0.2;
        }

        this.view.init(this.config.colors, perf);
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
        const elapsed = (performance.now() - this.startTime) / 1000;
        const cfg = this.config.physics;
        const pos = this.view.particles.geometry.attributes.position.array;

        // Behavior: Multi-layered ripple wave physics
        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            const x = pos[idx];
            const y = pos[idx + 1];
            const dist = Math.sqrt(x * x + y * y);

            let z = 0;
            for (let j = 0; j < cfg.waveFrequencies.length; j++) {
                z += Math.sin(dist * cfg.waveFrequencies[j] - elapsed * cfg.waveSpeeds[j]) * cfg.waveAmps[j];
            }

            // Behavior: Interactive local ripples
            if (this.isInteracting) {
                const dx = x - this.mouse3D.x;
                const dy = y - this.mouse3D.y;
                const mDist = Math.sqrt(dx * dx + dy * dy);
                if (mDist < cfg.rippleRadius) {
                    const ripple = Math.sin(mDist * 3 - elapsed * 8) * Math.exp(-mDist * 0.5);
                    z += ripple * cfg.rippleForce;
                }
            }

            pos[idx + 2] = z;
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;

        // Behavior: Gentle camera tilting logic
        this.view.camera.position.x = Math.sin(elapsed * 0.1) * 2;
        this.view.camera.position.y = Math.cos(elapsed * 0.1) * 2;
        this.view.camera.lookAt(0, 0, 0);

        this.view.render();
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
