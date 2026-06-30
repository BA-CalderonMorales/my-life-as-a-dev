/**
 * Smoke Mirrors ViewModel - Core Behavioral Logic
 * 
 * Orchestrates particle drift turbulence and mirror orbital rotations.
 */
import * as THREE from 'three';
import { SMOKE_MIRRORS_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = SMOKE_MIRRORS_CONFIG;
        this.isMobile = isMobile;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.count = perf.particleCount;
        this.particleSize = perf.size;

        this.positions = new Float32Array(this.count * 3);
        this.originalPositions = new Float32Array(this.count * 3);
        
        this.startTime = performance.now();
        this.mouse3D = new THREE.Vector3(0, 0, 0);
        this.isInteracting = false;
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    init(colors) {
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        // Behavior: Initial randomized particle placement
        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            const x = (Math.random() - 0.5) * 24;
            const y = (Math.random() - 0.5) * 16;
            const z = (Math.random() - 0.5) * 8;
            this.positions[idx] = x;
            this.positions[idx + 1] = y;
            this.positions[idx + 2] = z;
            this.originalPositions[idx] = x;
            this.originalPositions[idx + 1] = y;
            this.originalPositions[idx + 2] = z;
        }

        this.view.init(this.config.colors, perf);
        this.view.addParticles(this.positions, this.particleSize, this.config.colors.smoke);
        this.view.addMirrors(this.config.mirrorPositions, this.config.colors.mirror);
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
        const dt = 0.016;
        const cfg = this.config.physics;
        const pos = this.view.particles.geometry.attributes.position.array;

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            const ox = this.originalPositions[idx];
            const oy = this.originalPositions[idx + 1];
            const oz = this.originalPositions[idx + 2];

            // Behavior: Turbulent drift physics
            let x = ox + Math.sin(elapsed * 0.3 + oy * 0.5) * cfg.turbulence;
            let y = oy + elapsed * cfg.driftSpeed + Math.sin(elapsed * 0.5 + ox * 0.3) * 0.3;
            let z = oz + Math.cos(elapsed * 0.4 + ox * 0.4) * 0.3;

            // Behavior: Loop/regenerate smoke
            while (y > 10) y -= 20;

            // Behavior: Interactive push force
            if (this.isInteracting) {
                const dx = x - this.mouse3D.x;
                const dy = y - this.mouse3D.y;
                const dSq = dx*dx + dy*dy;
                if (dSq < cfg.pushRadiusSq) {
                    const d = Math.sqrt(dSq) + 0.01;
                    const f = (Math.sqrt(cfg.pushRadiusSq) - d) * cfg.pushForce;
                    x += (dx / d) * f;
                    y += (dy / d) * f;
                }
            }

            pos[idx] = x;
            pos[idx + 1] = y;
            pos[idx + 2] = z;
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;

        // Behavior: Mirror orbital rotation orchestration
        this.view.mirrors.forEach((m, i) => {
            m.rotation.x += 0.002 * (i + 1);
            m.rotation.y += 0.003 * (i + 1);
        });

        this.view.render();
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
