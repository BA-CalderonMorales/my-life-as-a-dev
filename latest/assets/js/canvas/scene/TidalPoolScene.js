import * as THREE from 'three';
import { ParticleFlowScene } from './ParticleFlowScene.js';

export class TidalPoolScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createParticles() {
        const count = this.isMobile ? 2500 : 5000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            // Concentric ring distribution
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * 12;
            positions[idx] = Math.cos(angle) * radius;
            positions[idx + 1] = Math.sin(angle) * radius;
            positions[idx + 2] = 0;

            // Blue/teal colors
            const t = Math.random();
            colors[idx] = 0.0;
            colors[idx + 1] = 0.4 + t * 0.4;
            colors[idx + 2] = 0.6 + t * 0.4;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        this.scene.background = new THREE.Color(0x000510);
        this.scene.fog = new THREE.FogExp2(0x000510, 0.02);

        // Camera above looking down
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const time = this.clock.getElapsedTime();
            const positions = this.particles.geometry.attributes.position.array;
            const count = positions.length / 3;

            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                const x = positions[idx];
                const y = positions[idx + 1];
                const dist = Math.sqrt(x * x + y * y);

                // Multiple sine wave frequencies
                const wave1 = Math.sin(dist * 0.8 - time * 2);
                const wave2 = Math.sin(dist * 1.5 - time * 3) * 0.5;
                const wave3 = Math.sin(dist * 0.3 - time * 1) * 0.3;
                let z = wave1 + wave2 + wave3;

                // Mouse ripple disturbance
                if (this.isInteracting) {
                    const mx = this.mouse3D.x;
                    const my = this.mouse3D.y;
                    const mouseDist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
                    if (mouseDist < 5) {
                        const ripple = Math.sin(mouseDist * 3 - time * 8) * Math.exp(-mouseDist * 0.5);
                        z += ripple * 0.8;
                    }
                }

                positions[idx + 2] = z;
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}
