/**
 * Bismuth Fracture ViewModel - Core Behavioral Logic
 *
 * This file contains ALL logic: stack generation, fractal scaling math,
 * rotation updates, and matrix orchestrations.
 */
import * as THREE from 'three';
import { BISMUTH_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = BISMUTH_CONFIG;
        this.isMobile = isMobile;

        this.stackConfigs = [];
        this.totalInstances = 0;
        
        // Reusable objects for matrix math (Behavioral Efficiency)
        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
    }

    init() {
        const stackCount = this.isMobile ? this.config.mobile.stackCount : this.config.desktop.stackCount;
        const phys = this.config.physics;

        // Behavior: Generate randomized fractal stack configurations
        for (let s = 0; s < stackCount; s++) {
            const steps = this.config.stepsMin + Math.floor(Math.random() * (this.config.stepsMax - this.config.stepsMin + 1));
            const baseSize = phys.baseSizeMin + Math.random() * (phys.baseSizeMax - phys.baseSizeMin);
            const stackHue = (s / stackCount) % 1.0;
            const angle = (s / stackCount) * Math.PI * 2 + Math.random() * 0.5;
            const dist = phys.distMin + Math.random() * (phys.distMax - phys.distMin);
            const rotSpeed = (Math.random() - 0.5) * phys.rotSpeedMax;
            
            this.stackConfigs.push({ 
                steps, baseSize, stackHue, angle, dist, rotSpeed, 
                currentRot: Math.random() * Math.PI * 2 
            });
            this.totalInstances += steps;
        }

        // Push structural requirements to passive View
        this.view.addInstancedMesh(this.totalInstances);
    }

    update() {
        if (!this.view.instancedMesh) return;

        let instanceIdx = 0;
        const dt = 0.016;

        this.stackConfigs.forEach((stack) => {
            stack.currentRot += stack.rotSpeed;

            for (let i = 0; i < stack.steps; i++) {
                const t = i / stack.steps;
                const size = stack.baseSize * Math.pow(0.85, i);
                
                // Behavior: Archimedean spiral / fractal placement
                const localAngle = stack.currentRot + i * 0.4;
                const radius = stack.dist + Math.sin(i * 0.5) * 0.5;
                
                this.dummy.position.set(
                    Math.cos(stack.angle) * radius + Math.cos(localAngle) * (i * 0.2),
                    i * size * 0.8 - 4,
                    Math.sin(stack.angle) * radius + Math.sin(localAngle) * (i * 0.2)
                );

                this.dummy.rotation.set(localAngle, stack.angle, i * 0.1);
                this.dummy.scale.setScalar(size);
                this.dummy.updateMatrix();
                
                this.view.instancedMesh.setMatrixAt(instanceIdx, this.dummy.matrix);

                // Behavior: Color gradient per stack
                this.color.setHSL(stack.stackHue, 0.4, 0.3 + (1 - t) * 0.4);
                this.view.instancedMesh.setColorAt(instanceIdx, this.color);
                
                instanceIdx++;
            }
        });

        this.view.instancedMesh.instanceMatrix.needsUpdate = true;
        if (this.view.instancedMesh.instanceColor) {
            this.view.instancedMesh.instanceColor.needsUpdate = true;
        }

        this.view.render();
    }
}
