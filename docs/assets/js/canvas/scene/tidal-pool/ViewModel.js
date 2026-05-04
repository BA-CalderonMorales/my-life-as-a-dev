/**
 * Tidal Pool ViewModel - Ripple Physics and Interaction
 */
import * as THREE from 'three';
import { TIDAL_POOL_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, count) {
        this.view = view;
        this.count = count;
        this.startTime = performance.now();
        this.mouse3D = new THREE.Vector3(0, 0, 0);
        this.isInteracting = false;
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
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
        const cfg = TIDAL_POOL_CONFIG.physics;

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            const x = positions[idx];
            const y = positions[idx + 1];
            const dist = Math.sqrt(x * x + y * y);

            let z = 0;
            for (let j = 0; j < cfg.waveFrequencies.length; j++) {
                z += Math.sin(dist * cfg.waveFrequencies[j] - elapsed * cfg.waveSpeeds[j]) * cfg.waveAmps[j];
            }

            if (this.isInteracting) {
                const dx = x - this.mouse3D.x;
                const dy = y - this.mouse3D.y;
                const mDist = Math.sqrt(dx * dx + dy * dy);
                if (mDist < cfg.rippleRadius) {
                    const ripple = Math.sin(mDist * 3 - elapsed * 8) * Math.exp(-mDist * 0.5);
                    z += ripple * cfg.rippleForce;
                }
            }

            positions[idx + 2] = z;
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;

        // Creative touch: Slight camera tilt
        this.view.camera.position.x = Math.sin(elapsed * 0.1) * 2;
        this.view.camera.position.y = Math.cos(elapsed * 0.1) * 2;
        this.view.camera.lookAt(0, 0, 0);

        this.view.render();
    }
}
