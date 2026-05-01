import * as THREE from 'three';
import { ParticleFlowScene } from './ParticleFlowScene.js';

export class DigitalRainScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createParticles() {
        const columns = 50;
        const particlesPerColumn = this.isMobile ? 20 : 30;
        const count = columns * particlesPerColumn;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const columnIndices = new Int32Array(count);
        const speeds = new Float32Array(count);
        const flashes = new Float32Array(count);

        const columnWidth = 30 / columns;

        for (let col = 0; col < columns; col++) {
            const x = (col - columns / 2) * columnWidth + (Math.random() - 0.5) * columnWidth * 0.5;
            for (let row = 0; row < particlesPerColumn; row++) {
                const i = col * particlesPerColumn + row;
                const idx = i * 3;
                positions[idx] = x;
                positions[idx + 1] = 10 - (row / particlesPerColumn) * 20 + Math.random() * 2;
                positions[idx + 2] = (Math.random() - 0.5) * 5;
                columnIndices[i] = col;
                speeds[i] = 3 + Math.random() * 4;
                flashes[i] = 0;

                // Green gradient
                const brightness = 0.3 + Math.random() * 0.5;
                colors[idx] = 0;
                colors[idx + 1] = brightness;
                colors[idx + 2] = 0;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Floor reflection plane
        const planeGeo = new THREE.PlaneGeometry(40, 40);
        const planeMat = new THREE.MeshBasicMaterial({
            color: 0x003300,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
        });
        this.floor = new THREE.Mesh(planeGeo, planeMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.y = -12;
        this.scene.add(this.floor);

        this.columnIndices = columnIndices;
        this.particleSpeeds = speeds;
        this.particleFlashes = flashes;
        this.particlesPerColumn = particlesPerColumn;
        this.columns = columns;

        this.scene.background = new THREE.Color(0x020202);
        this.scene.fog = new THREE.FogExp2(0x020202, 0.01);

        // Camera looks slightly upward
        this.camera.position.set(0, -5, 25);
        this.camera.lookAt(0, 2, 0);
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const positions = this.particles.geometry.attributes.position.array;
            const colors = this.particles.geometry.attributes.color.array;
            const count = positions.length / 3;
            const dt = 0.016;

            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                positions[idx + 1] -= this.particleSpeeds[i] * dt;

                // Flash decay
                if (this.particleFlashes[i] > 0) {
                    this.particleFlashes[i] -= dt * 2;
                }

                // Reset when below bottom
                if (positions[idx + 1] < -12) {
                    positions[idx + 1] = 12;
                    this.particleFlashes[i] = 1.0;
                }

                // Color: flash bright green, then fade to dark green
                const flash = Math.max(0, this.particleFlashes[i]);
                const baseGreen = 0.1 + (Math.sin(positions[idx + 1] * 0.5) + 1) * 0.15;
                const green = Math.min(1.0, baseGreen + flash);
                colors[idx] = 0;
                colors[idx + 1] = green;
                colors[idx + 2] = flash * 0.2;
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.geometry.attributes.color.needsUpdate = true;

            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}
