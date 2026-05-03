import * as THREE from 'three';
import { ParticleFlowScene } from './ParticleFlowScene.js';

export class SolarFlareScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createParticles() {
        const count = this.isMobile ? 4000 : 6000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const ages = new Float32Array(count);
        const lifetimes = new Float32Array(count);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            this._resetParticle(positions, colors, ages, lifetimes, velocities, i, true);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.12,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Central sun sphere
        const sunGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
        });
        this.sun = new THREE.Mesh(sunGeo, sunMat);
        this.scene.add(this.sun);

        // Sun glow
        const glowGeo = new THREE.SphereGeometry(1.6, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.sunGlow = new THREE.Mesh(glowGeo, glowMat);
        this.scene.add(this.sunGlow);

        this.particleAges = ages;
        this.particleLifetimes = lifetimes;
        this.particleVelocities = velocities;

        this.scene.background = new THREE.Color(0x050200);
        this.scene.fog = new THREE.FogExp2(0x050200, 0.008);
    }

    _resetParticle(positions, colors, ages, lifetimes, velocities, i, randomStart = false) {
        const idx = i * 3;
        positions[idx] = 0;
        positions[idx + 1] = 0;
        positions[idx + 2] = 0;

        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        const speed = 1.5 + Math.random() * 3;

        velocities[idx] = Math.cos(elevation) * Math.cos(angle) * speed;
        velocities[idx + 1] = Math.cos(elevation) * Math.sin(angle) * speed;
        velocities[idx + 2] = Math.sin(elevation) * speed;

        ages[i] = randomStart ? Math.random() * 3 : 0;
        lifetimes[i] = 2 + Math.random() * 3;

        // Start white/yellow
        colors[idx] = 1.0;
        colors[idx + 1] = 0.9;
        colors[idx + 2] = 0.6;
    }

    _updateColor(colors, age, lifetime, i) {
        const idx = i * 3;
        const t = age / lifetime;
        if (t < 0.2) {
            colors[idx] = 1.0;
            colors[idx + 1] = 0.95;
            colors[idx + 2] = 0.8;
        } else if (t < 0.5) {
            colors[idx] = 1.0;
            colors[idx + 1] = 0.7;
            colors[idx + 2] = 0.2;
        } else if (t < 0.8) {
            colors[idx] = 1.0;
            colors[idx + 1] = 0.35;
            colors[idx + 2] = 0.05;
        } else {
            colors[idx] = 0.6;
            colors[idx + 1] = 0.1;
            colors[idx + 2] = 0.02;
        }
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
                this.particleAges[i] += dt;

                if (this.particleAges[i] > this.particleLifetimes[i]) {
                    this._resetParticle(positions, colors, this.particleAges, this.particleLifetimes, this.particleVelocities, i);
                    continue;
                }

                // Accelerate outward
                this.particleVelocities[idx] *= 1.01;
                this.particleVelocities[idx + 1] *= 1.01;
                this.particleVelocities[idx + 2] *= 1.01;

                positions[idx] += this.particleVelocities[idx] * dt;
                positions[idx + 1] += this.particleVelocities[idx + 1] * dt;
                positions[idx + 2] += this.particleVelocities[idx + 2] * dt;

                this._updateColor(colors, this.particleAges[i], this.particleLifetimes[i], i);
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.geometry.attributes.color.needsUpdate = true;

            // Pulse sun glow
            const time = this.clock.getElapsedTime();
            this.sunGlow.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
            this.sun.rotation.y += 0.005;

            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}
