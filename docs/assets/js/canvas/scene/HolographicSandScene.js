import * as THREE from 'three';
import { ParticleFlowScene } from './ParticleFlowScene.js';

export class HolographicSandScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.formationState = 'drifting'; // drifting, forming, holding, returning
        this.formationTimer = 0;
        this.formationTarget = 'tetrahedron';
        this.formationProgress = 0;
        this.targetPositions = null;
    }

    _createParticles() {
        const count = this.isMobile ? 3000 : 6000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const randomPositions = new Float32Array(count * 3);
        const targetPositions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 14;
            const z = (Math.random() - 0.5) * 10;
            positions[idx] = x;
            positions[idx + 1] = y;
            positions[idx + 2] = z;
            randomPositions[idx] = x;
            randomPositions[idx + 1] = y;
            randomPositions[idx + 2] = z;
            velocities[idx] = (Math.random() - 0.5) * 0.01;
            velocities[idx + 1] = (Math.random() - 0.5) * 0.01;
            velocities[idx + 2] = (Math.random() - 0.5) * 0.01;
            targetPositions[idx] = x;
            targetPositions[idx + 1] = y;
            targetPositions[idx + 2] = z;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x55ffff,
            size: 0.06,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        this.randomPositions = randomPositions;
        this.velocities = velocities;
        this.targetPositionsBuffer = targetPositions;

        // Grid floor
        const gridHelper = new THREE.GridHelper(30, 30, 0x113333, 0x0a2222);
        gridHelper.position.y = -8;
        this.scene.add(gridHelper);

        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.FogExp2(0x050505, 0.012);

        // Click/tap interaction
        this.container.addEventListener('click', () => this._triggerFormation());
        this.container.addEventListener('touchstart', () => this._triggerFormation());
    }

    _generateShapePositions(shape, count) {
        const positions = new Float32Array(count * 3);
        if (shape === 'tetrahedron') {
            const vertices = [
                new THREE.Vector3(0, 2, 0),
                new THREE.Vector3(-2, -1.5, 1.5),
                new THREE.Vector3(2, -1.5, 1.5),
                new THREE.Vector3(0, -1.5, -2.5),
            ];
            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                const v0 = vertices[Math.floor(Math.random() * 4)];
                const v1 = vertices[Math.floor(Math.random() * 4)];
                const t = Math.random();
                const p = new THREE.Vector3().lerpVectors(v0, v1, t);
                // Also lerp to a third point for volume
                const v2 = vertices[Math.floor(Math.random() * 4)];
                const s = Math.random() * 0.5;
                p.lerp(v2, s);
                positions[idx] = p.x;
                positions[idx + 1] = p.y;
                positions[idx + 2] = p.z;
            }
        } else if (shape === 'cube') {
            const size = 2.5;
            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                const face = Math.floor(Math.random() * 6);
                const u = (Math.random() - 0.5) * 2 * size;
                const v = (Math.random() - 0.5) * 2 * size;
                if (face === 0) { positions[idx] = size; positions[idx + 1] = u; positions[idx + 2] = v; }
                else if (face === 1) { positions[idx] = -size; positions[idx + 1] = u; positions[idx + 2] = v; }
                else if (face === 2) { positions[idx] = u; positions[idx + 1] = size; positions[idx + 2] = v; }
                else if (face === 3) { positions[idx] = u; positions[idx + 1] = -size; positions[idx + 2] = v; }
                else if (face === 4) { positions[idx] = u; positions[idx + 1] = v; positions[idx + 2] = size; }
                else { positions[idx] = u; positions[idx + 1] = v; positions[idx + 2] = -size; }
            }
        } else if (shape === 'sphere') {
            const radius = 2.5;
            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = radius * (0.9 + Math.random() * 0.1);
                positions[idx] = r * Math.sin(phi) * Math.cos(theta);
                positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[idx + 2] = r * Math.cos(phi);
            }
        }
        return positions;
    }

    _triggerFormation() {
        if (this.formationState !== 'drifting' && this.formationState !== 'returning') return;
        const shapes = ['tetrahedron', 'cube', 'sphere'];
        this.formationTarget = shapes[Math.floor(Math.random() * shapes.length)];
        const newTargets = this._generateShapePositions(this.formationTarget, this.targetPositionsBuffer.length / 3);
        this.targetPositionsBuffer.set(newTargets);
        this.formationState = 'forming';
        this.formationProgress = 0;
        this.formationTimer = 0;
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const dt = 0.016;
            const positions = this.particles.geometry.attributes.position.array;
            const count = positions.length / 3;

            // State machine
            if (this.formationState === 'forming') {
                this.formationProgress += dt;
                if (this.formationProgress >= 1.0) {
                    this.formationProgress = 1.0;
                    this.formationState = 'holding';
                    this.formationTimer = 0;
                }
            } else if (this.formationState === 'holding') {
                this.formationTimer += dt;
                if (this.formationTimer >= 2.0) {
                    this.formationState = 'returning';
                    this.formationProgress = 1.0;
                }
            } else if (this.formationState === 'returning') {
                this.formationProgress -= dt;
                if (this.formationProgress <= 0) {
                    this.formationProgress = 0;
                    this.formationState = 'drifting';
                }
            }

            const t = this.formationProgress;
            const easeT = t * t * (3 - 2 * t); // smoothstep

            for (let i = 0; i < count; i++) {
                const idx = i * 3;

                if (this.formationState === 'drifting') {
                    // Brownian motion
                    this.velocities[idx] += (Math.random() - 0.5) * 0.001;
                    this.velocities[idx + 1] += (Math.random() - 0.5) * 0.001;
                    this.velocities[idx + 2] += (Math.random() - 0.5) * 0.001;
                    this.velocities[idx] *= 0.99;
                    this.velocities[idx + 1] *= 0.99;
                    this.velocities[idx + 2] *= 0.99;

                    positions[idx] += this.velocities[idx];
                    positions[idx + 1] += this.velocities[idx + 1];
                    positions[idx + 2] += this.velocities[idx + 2];

                    // Soft boundary
                    if (Math.abs(positions[idx]) > 12) this.velocities[idx] *= -1;
                    if (Math.abs(positions[idx + 1]) > 9) this.velocities[idx + 1] *= -1;
                    if (Math.abs(positions[idx + 2]) > 6) this.velocities[idx + 2] *= -1;
                } else {
                    // Lerp between random and target
                    const rx = this.randomPositions[idx];
                    const ry = this.randomPositions[idx + 1];
                    const rz = this.randomPositions[idx + 2];
                    const tx = this.targetPositionsBuffer[idx];
                    const ty = this.targetPositionsBuffer[idx + 1];
                    const tz = this.targetPositionsBuffer[idx + 2];

                    positions[idx] = rx + (tx - rx) * easeT;
                    positions[idx + 1] = ry + (ty - ry) * easeT;
                    positions[idx + 2] = rz + (tz - rz) * easeT;
                }
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}
