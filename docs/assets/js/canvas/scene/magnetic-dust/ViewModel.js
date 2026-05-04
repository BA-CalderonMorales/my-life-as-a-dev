/**
 * Magnetic Dust ViewModel - Physics and Interaction
 */
import * as THREE from 'three';
import { MAGNETIC_DUST_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view) {
        this.view = view;
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
        const positions = this.view.particles.geometry.attributes.position.array;
        const count = positions.length / 3;
        const cfg = MAGNETIC_DUST_CONFIG;
        const dt = 0.016;

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            let px = positions[idx];
            let py = positions[idx + 1];
            let pz = positions[idx + 2];

            // Field drift
            px += Math.cos(py * cfg.physics.fieldScale) * dt;
            py += Math.sin(px * (cfg.physics.fieldScale + 0.1)) * dt;
            
            // Browninan jitter
            px += (Math.random() - 0.5) * cfg.physics.noiseAmount;
            py += (Math.random() - 0.5) * cfg.physics.noiseAmount;
            pz += (Math.random() - 0.5) * cfg.physics.noiseAmount;

            // Magnetic attraction
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

            // Wrapping
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
}
