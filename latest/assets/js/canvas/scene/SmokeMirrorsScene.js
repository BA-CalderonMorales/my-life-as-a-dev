import * as THREE from 'three';
import { ParticleFlowScene } from './ParticleFlowScene.js';

export class SmokeMirrorsScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createParticles() {
        const count = this.isMobile ? 1000 : 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const opacities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            positions[idx] = (Math.random() - 0.5) * 24;
            positions[idx + 1] = (Math.random() - 0.5) * 16;
            positions[idx + 2] = (Math.random() - 0.5) * 8;
            originalPositions[idx] = positions[idx];
            originalPositions[idx + 1] = positions[idx + 1];
            originalPositions[idx + 2] = positions[idx + 2];
            sizes[i] = 0.3 + Math.random() * 0.5;
            opacities[i] = 0.3 + Math.random() * 0.4;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            color: 0x888888,
            size: 0.4,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.NormalBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Hidden mirror geometries
        const mirrorShapes = [
            new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16),
            new THREE.IcosahedronGeometry(1.8, 0),
            new THREE.OctahedronGeometry(1.5, 0),
        ];

        this.mirrors = [];
        const positions3D = [
            { x: -5, y: 2, z: -3 },
            { x: 4, y: -1, z: -4 },
            { x: 0, y: 3, z: -5 },
        ];

        for (let i = 0; i < mirrorShapes.length; i++) {
            const mat = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 1.0,
                roughness: 0.0,
                envMapIntensity: 1.0,
            });
            const mesh = new THREE.Mesh(mirrorShapes[i], mat);
            mesh.position.set(positions3D[i].x, positions3D[i].y, positions3D[i].z);
            this.scene.add(mesh);
            this.mirrors.push(mesh);
        }

        // Lighting for mirrors
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 50);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);

        this.smokeOriginalPositions = originalPositions;
        this.smokeOpacities = opacities;

        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);
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
                const ox = this.smokeOriginalPositions[idx];
                const oy = this.smokeOriginalPositions[idx + 1];
                const oz = this.smokeOriginalPositions[idx + 2];

                // Drift upward with turbulence
                let x = ox + Math.sin(time * 0.3 + oy * 0.5) * 0.5;
                let y = oy + time * 0.3 + Math.sin(time * 0.5 + ox * 0.3) * 0.3;
                let z = oz + Math.cos(time * 0.4 + ox * 0.4) * 0.3;

                // Regenerate at bottom
                while (y > 10) {
                    y -= 20;
                }

                // Mouse push interaction
                if (this.isInteracting) {
                    const mx = this.mouse3D.x;
                    const my = this.mouse3D.y;
                    const distSq = (x - mx) ** 2 + (y - my) ** 2;
                    if (distSq < 9) {
                        const dist = Math.sqrt(distSq) + 0.01;
                        const push = (3 - dist) * 0.1;
                        x += (x - mx) / dist * push;
                        y += (y - my) / dist * push;
                    }
                }

                positions[idx] = x;
                positions[idx + 1] = y;
                positions[idx + 2] = z;
            }

            this.particles.geometry.attributes.position.needsUpdate = true;

            // Slowly rotate mirrors
            this.mirrors.forEach((mirror, i) => {
                mirror.rotation.x += 0.002 * (i + 1);
                mirror.rotation.y += 0.003 * (i + 1);
            });

            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}
