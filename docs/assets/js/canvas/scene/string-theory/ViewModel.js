/**
 * String Theory ViewModel - Core Logic and Tunnel Physics
 */
import * as THREE from 'three';
import { STRING_THEORY_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, count, length) {
        this.view = view;
        this.count = count;
        this.length = length;
        this.stringData = [];
        this.startTime = performance.now();
    }

    init() {
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
                rotationSpeed: STRING_THEORY_CONFIG.physics.rotationBase + Math.random() * STRING_THEORY_CONFIG.physics.rotationVariance,
                halfLength: this.length * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        
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

        // Creative touch: Tunnel camera orbit
        const cam = this.view.camera;
        const radius = 15;
        cam.position.x = Math.sin(elapsed * 0.12) * radius;
        cam.position.z = Math.cos(elapsed * 0.12) * radius;
        cam.position.y = Math.sin(elapsed * 0.05) * 3;
        cam.lookAt(0, 0, 0);

        this.view.render();
    }
}
