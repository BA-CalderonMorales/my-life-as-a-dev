import * as THREE from 'three';
import { ParticleFlowScene } from './ParticleFlowScene.js';

export class MagneticDustScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createParticles() {
        const count = this.isMobile ? 3000 : 8000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            velocities[i * 3] = 0;
            velocities[i * 3 + 1] = 0;
            velocities[i * 3 + 2] = 0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.06,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.85,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);
        this.scene.background = new THREE.Color(0x0a0a0a);
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const positions = this.particles.geometry.attributes.position.array;
            const count = positions.length / 3;
            const dt = 0.016;

            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                let x = positions[idx];
                let y = positions[idx + 1];
                let z = positions[idx + 2];

                const dx = Math.cos(y * 0.4) * dt;
                const dy = Math.sin(x * 0.5) * Math.cos(z * 0.3) * dt;
                const dz = 0;

                x += dx + (Math.random() - 0.5) * 0.005;
                y += dy + (Math.random() - 0.5) * 0.005;
                z += dz + (Math.random() - 0.5) * 0.005;

                // Mouse magnet interaction
                if (this.isInteracting) {
                    const mx = this.mouse3D.x;
                    const my = this.mouse3D.y;
                    const mz = this.mouse3D.z;
                    const distSq = (x - mx) ** 2 + (y - my) ** 2 + (z - mz) ** 2;
                    if (distSq < 16) {
                        const dist = Math.sqrt(distSq) + 0.01;
                        const force = (4 - dist) * 0.02;
                        x += (mx - x) / dist * force;
                        y += (my - y) / dist * force;
                    }
                }

                // Wrap around
                if (x > 15) x -= 30;
                if (x < -15) x += 30;
                if (y > 10) y -= 20;
                if (y < -10) y += 20;
                if (z > 5) z -= 10;
                if (z < -5) z += 10;

                positions[idx] = x;
                positions[idx + 1] = y;
                positions[idx + 2] = z;
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}
