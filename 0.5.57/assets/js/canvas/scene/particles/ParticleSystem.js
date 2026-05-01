/**
 * Particle System - Floating dust and mineral particles
 * 
 * Creates an atmospheric particle field that responds to mouse
 * interaction with attraction behavior.
 */
import * as THREE from 'three';

export class ParticleSystem {
    constructor(options = {}) {
        this.count = options.count || 1000;
        this.color = options.color || 0x7a7a75;
        this.size = options.size || 0.05;
        this.opacity = options.opacity || 0.28;
        this.bounds = options.bounds || { x: 25, y: 20, z: 20 };
        this.attractionRadius = options.attractionRadius || 8;
        this.attractionStrength = options.attractionStrength || 0.025;

        this.positions = null;
        this.velocities = [];
        this.geometry = null;
        this.material = null;
        this.points = null;
    }

    create() {
        this.positions = new Float32Array(this.count * 3);

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            this.positions[i3] = (Math.random() - 0.5) * this.bounds.x;
            this.positions[i3 + 1] = (Math.random() - 0.5) * this.bounds.y;
            this.positions[i3 + 2] = (Math.random() - 0.5) * this.bounds.z;

            this.velocities.push({
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002 + 0.001,
                z: (Math.random() - 0.5) * 0.002
            });
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));

        this.material = new THREE.PointsMaterial({
            color: this.color,
            size: this.size,
            transparent: true,
            opacity: this.opacity,
            sizeAttenuation: true,
            blending: THREE.NormalBlending,
        });

        this.points = new THREE.Points(this.geometry, this.material);
        return this.points;
    }

    /**
     * Update particles with optional mouse attraction
     * @param {THREE.Vector3} mousePos - Mouse position in 3D space (optional)
     */
    update(mousePos = null) {
        const positions = this.geometry.attributes.position.array;
        const halfX = this.bounds.x / 2;
        const halfY = this.bounds.y / 2;
        const halfZ = this.bounds.z / 2;

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            const vel = this.velocities[i];

            // Mouse attraction
            if (mousePos) {
                const dx = mousePos.x - positions[i3];
                const dy = mousePos.y - positions[i3 + 1];
                const dz = mousePos.z - positions[i3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < this.attractionRadius && dist > 0.1) {
                    const force = this.attractionStrength * (1 - dist / this.attractionRadius);
                    vel.x += (dx / dist) * force;
                    vel.y += (dy / dist) * force;
                    vel.z += (dz / dist) * force;
                }
            }

            // Velocity damping
            vel.x *= 0.98;
            vel.y *= 0.98;
            vel.z *= 0.98;

            // Upward drift
            vel.y += 0.0002;

            // Update position
            positions[i3] += vel.x;
            positions[i3 + 1] += vel.y;
            positions[i3 + 2] += vel.z;

            // Wrap around bounds
            if (positions[i3] > halfX) positions[i3] = -halfX;
            if (positions[i3] < -halfX) positions[i3] = halfX;
            if (positions[i3 + 1] > halfY) positions[i3 + 1] = -halfY;
            if (positions[i3 + 1] < -halfY) positions[i3 + 1] = halfY;
            if (positions[i3 + 2] > halfZ) positions[i3 + 2] = -halfZ;
            if (positions[i3 + 2] < -halfZ) positions[i3 + 2] = halfZ;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * Update appearance for theme change
     */
    updateTheme(color, size, opacity) {
        this.material.color.setHex(color);
        this.material.size = size;
        this.material.opacity = opacity;
    }

    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
    }
}
