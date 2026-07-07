/**
 * Obsidian Shards ViewModel - Core Behavioral Logic
 * 
 * Orchestrates shard generation, monolith drift physics, 
 * and rotational updates.
 */
import * as THREE from 'three';
import { OBSIDIAN_CONFIG, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = OBSIDIAN_CONFIG;
        this.isMobile = isMobile;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.count = perf.shardCount;

        this.shardStates = [];
        this.startTime = performance.now();
        this.dummy = new THREE.Object3D();
    }

    init() {
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        const colors = getColors();

        this.view.init(colors, perf);
        this.view.addPointLights(this.config.lightPositions, colors.lights);
        this.view.addInstancedShards(this.count, colors);

        // Behavior: Generate randomized shard configurations
        for (let i = 0; i < this.count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 2 + Math.random() * 7;
            
            const state = {
                scale: new THREE.Vector3(
                    0.3 + Math.random() * 0.4,
                    3 + Math.random() * 5,
                    0.2 + Math.random() * 0.3
                ),
                initialPos: new THREE.Vector3(
                    Math.cos(angle) * dist,
                    (Math.random() - 0.5) * 4,
                    Math.sin(angle) * dist
                ),
                rot: new THREE.Euler(
                    Math.random() * 0.4,
                    Math.random() * Math.PI * 2,
                    Math.random() * 0.4
                ),
                rotSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * this.config.physics.rotSpeedMax,
                    (Math.random() - 0.5) * this.config.physics.rotSpeedMax,
                    (Math.random() - 0.5) * this.config.physics.rotSpeedMax
                ),
                floatSpeed: 0.3 + Math.random() * 0.7,
                floatOffset: Math.random() * Math.PI * 2
            };

            this.shardStates.push(state);
        }
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const dt = 0.016;

        this.shardStates.forEach((state, i) => {
            // Behavior: Gentle drift physics
            const driftY = Math.sin(elapsed * state.floatSpeed + state.floatOffset) * this.config.physics.driftSpeed;
            
            this.dummy.position.copy(state.initialPos);
            this.dummy.position.y += driftY;

            // Behavior: Constant rotation
            state.rot.x += state.rotSpeed.x * dt;
            state.rot.y += state.rotSpeed.y * dt;
            state.rot.z += state.rotSpeed.z * dt;
            this.dummy.rotation.copy(state.rot);

            this.dummy.scale.copy(state.scale);
            this.dummy.updateMatrix();
            this.view.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        });

        this.view.instancedMesh.instanceMatrix.needsUpdate = true;
        
        // Behavior: Minimal camera sway
        this.view.camera.position.x = Math.sin(elapsed * 0.15) * 1.5;
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
