/**
 * String Theory ViewModel - Core Behavioral Logic
 * 
 * Orchestrates string midpoint drifting, orbital rotations,
 * and tunnel camera physics.
 */
import * as THREE from 'three';
import { STRING_THEORY_CONFIG, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = STRING_THEORY_CONFIG;
        this.isMobile = isMobile;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.count = perf.stringCount;
        this.length = perf.stringLength;

        this.stringData = [];
        this.startTime = performance.now();
    }

    init() {
        const colors = getColors();
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        this.view.init(colors, perf);
        this.view.addStrings(this.count, colors.lineColor, this.config.colors.opacity);

        // Behavior: Generate randomized string initial states
        for (let i = 0; i < this.count; i++) {
            const dir = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();

            const mid = dir.clone().multiplyScalar(this.length * 0.5 + Math.random() * 8);
            
            this.stringData.push({
                midpoint: mid,
                direction: dir,
                rotationAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
                rotationSpeed: this.config.physics.rotationBase + Math.random() * this.config.physics.rotationVariance,
                halfLength: this.length * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        
        // Behavior: Orchestrate string movements and rotations
        this.view.strings.forEach((str, i) => {
            const data = this.stringData[i];
            const t = elapsed * data.rotationSpeed + data.phase;

            const rotQuat = new THREE.Quaternion().setFromAxisAngle(data.rotationAxis, t);
            const dir = data.direction.clone().applyQuaternion(rotQuat);

            const driftedMid = data.midpoint.clone();
            driftedMid.z += Math.sin(elapsed * 0.2 + data.phase) * 4;
            driftedMid.x += Math.cos(elapsed * 0.15 + data.phase) * 2;

            const half = dir.multiplyScalar(data.halfLength);
            const p1 = driftedMid.clone().sub(half);
            const p2 = driftedMid.clone().add(half);

            const pos = str.geometry.attributes.position.array;
            pos[0] = p1.x; pos[1] = p1.y; pos[2] = p1.z;
            pos[3] = p2.x; pos[4] = p2.y; pos[5] = p2.z;
            str.geometry.attributes.position.needsUpdate = true;
        });

        // Behavior: Tunnel camera orbit logic
        const cam = this.view.camera;
        const radius = 15;
        cam.position.x = Math.sin(elapsed * 0.12) * radius;
        cam.position.z = Math.cos(elapsed * 0.12) * radius;
        cam.position.y = Math.sin(elapsed * 0.05) * 3;
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
