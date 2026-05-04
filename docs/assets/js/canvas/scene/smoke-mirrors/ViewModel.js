/**
 * Smoke Mirrors ViewModel - Core Logic and Interaction
 */
import * as THREE from 'three';
import { SMOKE_MIRRORS_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, particleCount) {
        this.view = view;
        this.count = particleCount;
        this.originalPositions = null;
        this.startTime = performance.now();
        
        this.mouse3D = new THREE.Vector3(0, 0, 0);
        this.isInteracting = false;
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    init(initialPositions) {
        this.originalPositions = new Float32Array(initialPositions);
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
        const positions = this.view.particles.geometry.attributes.position.array;
        const cfg = SMOKE_MIRRORS_CONFIG.physics;

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            const ox = this.originalPositions[idx];
            const oy = this.originalPositions[idx + 1];
            const oz = this.originalPositions[idx + 2];

            let x = ox + Math.sin(elapsed * 0.3 + oy * 0.5) * cfg.turbulence;
            let y = oy + elapsed * cfg.driftSpeed + Math.sin(elapsed * 0.5 + ox * 0.3) * 0.3;
            let z = oz + Math.cos(elapsed * 0.4 + ox * 0.4) * 0.3;

            // Regenerate loop
            while (y > 10) y -= 20;

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

            positions[idx] = x;
            positions[idx + 1] = y;
            positions[idx + 2] = z;
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;

        // Mirror rotation
        this.view.mirrors.forEach((m, i) => {
            m.rotation.x += 0.002 * (i + 1);
            m.rotation.y += 0.003 * (i + 1);
        });

        this.view.render();
    }
}
