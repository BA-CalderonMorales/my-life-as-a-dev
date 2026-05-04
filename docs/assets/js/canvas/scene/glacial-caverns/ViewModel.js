/**
 * Glacial Caverns ViewModel - Core Behavioral Logic
 * 
 * Orchestrates ice block generation, drift physics,
 * and rotation updates.
 */
import * as THREE from 'three';
import { GLACIAL_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = GLACIAL_CONFIG;
        this.isMobile = isMobile;

        this.startTime = performance.now();
        this.blockConfigs = [];
        this.blockCount = isMobile ? this.config.mobile.blockCount : this.config.desktop.blockCount;

        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
    }

    init(colors) {
        const perf = this.isMobile ? this.config.mobile : this.config.desktop;

        this.view.init(colors, perf);
        this.view.addPointLights(this.config.lightPositions, colors.light);
        this.view.addInstancedBlocks(this.blockCount);

        // Behavior: Generate randomized ice block initial states
        for (let i = 0; i < this.blockCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 8;
            
            const config = {
                scale: new THREE.Vector3(
                    0.6 + Math.random() * 1.4,
                    0.6 + Math.random() * 1.4,
                    0.6 + Math.random() * 1.4
                ),
                initialPos: new THREE.Vector3(
                    Math.cos(angle) * dist,
                    (Math.random() - 0.5) * 6,
                    Math.sin(angle) * dist
                ),
                rot: new THREE.Euler(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                ),
                rotSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * this.config.physics.rotationSpeed,
                    (Math.random() - 0.5) * this.config.physics.rotationSpeed,
                    (Math.random() - 0.5) * this.config.physics.rotationSpeed
                ),
                phase: Math.random() * Math.PI * 2
            };

            this.color.setHex(colors.ice[Math.floor(Math.random() * colors.ice.length)]);
            this.view.instancedMesh.setColorAt(i, this.color);
            this.blockConfigs.push(config);
        }
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const dt = 0.016;

        this.blockConfigs.forEach((block, i) => {
            // Behavior: Gentle drift physics
            const driftY = Math.sin(elapsed * 0.5 + block.phase) * this.config.physics.driftSpeed;
            
            this.dummy.position.copy(block.initialPos);
            this.dummy.position.y += driftY;

            // Behavior: Constant rotation
            block.rot.x += block.rotSpeed.x * dt;
            block.rot.y += block.rotSpeed.y * dt;
            block.rot.z += block.rotSpeed.z * dt;
            this.dummy.rotation.copy(block.rot);

            this.dummy.scale.copy(block.scale);
            this.dummy.updateMatrix();
            this.view.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        });

        this.view.instancedMesh.instanceMatrix.needsUpdate = true;
        
        // Creative touch: Breathable camera movement
        this.view.camera.position.y = 2 + Math.sin(elapsed * 0.3) * 1.0;
        this.view.camera.lookAt(0, 0, 0);

        this.view.render();
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
