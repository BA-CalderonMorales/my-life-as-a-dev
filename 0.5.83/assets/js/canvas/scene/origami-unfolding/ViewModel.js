/**
 * Origami Unfolding ViewModel - Core Behavioral Logic
 * 
 * Orchestrates plane positioning, interactive folding math,
 * and connection orchestration.
 */
import * as THREE from 'three';
import { ORIGAMI_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = ORIGAMI_CONFIG;
        this.isMobile = isMobile;

        this.mouse3D = new THREE.Vector3(0, 0, 1);
        this.isInteracting = false;
        this.startTime = performance.now();
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        this.planeConfigs = [];
        this.connectionPairs = [];
    }

    init(colors) {
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        this.view.init(colors, perf);
        this.view.addPlanes(this.config.normals.length, perf.planeSize, colors);

        // Behavior: Generate randomized plane initial states
        this.config.normals.forEach((n, i) => {
            const normal = new THREE.Vector3(...n).normalize();
            const pos = normal.clone().multiplyScalar(perf.distance);
            
            this.planeConfigs.push({
                baseNormal: normal.clone(),
                basePos: pos.clone(),
                rotationSpeed: 0.2 + Math.random() * 0.3,
                axis: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize(),
                currentRot: 0
            });

            // Push data to View (passive positioning)
            const plane = this.view.planes[i];
            plane.position.copy(pos);
            plane.lookAt(0, 0, 0);
        });

        // Behavior: Find connection pairs based on proximity
        for (let i = 0; i < this.planeConfigs.length; i++) {
            for (let j = i + 1; j < this.planeConfigs.length; j++) {
                const dist = this.planeConfigs[i].basePos.distanceTo(this.planeConfigs[j].basePos);
                if (dist < (this.isMobile ? 6 : 8)) {
                    this.connectionPairs.push([i, j]);
                }
            }
        }

        this.view.addConnections(this.connectionPairs, colors.line);
    }

    handleMouseMove(x, y) {
        this.isInteracting = true;
        this.raycaster.setFromCamera({ x, y }, this.view.camera);
        this.raycaster.ray.intersectPlane(this.plane, this.mouse3D);
    }

    handleInteractionEnd() {
        this.isInteracting = false;
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const dt = 0.016;

        // Behavior: Interactive "folding" logic
        const cursorDir = this.mouse3D.clone().normalize();
        
        this.view.planes.forEach((plane, i) => {
            const cfg = this.planeConfigs[i];
            
            // Behavior: Subtle self-rotation
            plane.rotateOnAxis(cfg.axis, cfg.rotationSpeed * dt * 0.1);
            
            let foldFactor = 0;
            if (this.isInteracting) {
                const dot = cfg.baseNormal.dot(cursorDir);
                if (dot > 0.2) foldFactor = (dot - 0.2) / 0.8;
            }
            
            const targetPos = cfg.basePos.clone().lerp(
                cfg.basePos.clone().multiplyScalar(0.5),
                foldFactor
            );
            plane.position.lerp(targetPos, 0.08);
        });

        // Behavior: Orchestrate connection positions
        this.view.connections.forEach((line, i) => {
            const [from, to] = this.connectionPairs[i];
            const pos = line.geometry.attributes.position.array;
            const p1 = this.view.planes[from].position;
            const p2 = this.view.planes[to].position;
            pos[0] = p1.x; pos[1] = p1.y; pos[2] = p1.z;
            pos[3] = p2.x; pos[4] = p2.y; pos[5] = p2.z;
            line.geometry.attributes.position.needsUpdate = true;
        });

        // Behavior: Breatheable camera orbit
        const cam = this.view.camera;
        const radius = 12;
        cam.position.x = Math.sin(elapsed * 0.2) * radius;
        cam.position.z = Math.cos(elapsed * 0.2) * radius;
        cam.position.y = Math.sin(elapsed * 0.1) * 2;
        cam.lookAt(0, 0, 0);

        this.view.render();
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
