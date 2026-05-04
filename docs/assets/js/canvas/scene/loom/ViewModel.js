/**
 * Loom ViewModel - Thread Physics and Interaction
 */
import * as THREE from 'three';
import { LOOM_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view) {
        this.view = view;
        this.startTime = performance.now();
        this.mouse3D = new THREE.Vector3(0, 0, 0);
        this.isInteracting = false;
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
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
        const cfg = LOOM_CONFIG.physics;

        this.view.threads.forEach(thread => {
            const pos = thread.line.geometry.attributes.position.array;
            const isHorizontal = thread.type === 'horizontal';

            for (let j = 0; j <= thread.segments; j++) {
                const t = j / thread.segments;
                const moving = t * thread.extent * 2 - thread.extent;
                const px = isHorizontal ? moving : thread.fixed;
                const py = isHorizontal ? thread.fixed : moving;
                
                const waveZ = Math.sin(px * 0.8 + elapsed * 1.2) * 
                             Math.cos(py * 0.8 + elapsed * 0.8) * 
                             cfg.waveDepth;

                let bendZ = 0;
                if (this.isInteracting) {
                    const dx = px - this.mouse3D.x;
                    const dy = py - this.mouse3D.y;
                    const distSq = dx*dx + dy*dy;
                    if (distSq < cfg.influenceRadius * cfg.influenceRadius) {
                        const dist = Math.sqrt(distSq);
                        const factor = 1 - dist / cfg.influenceRadius;
                        bendZ = Math.sin(factor * Math.PI) * cfg.bendDepth;
                    }
                }

                const idx = j * 3;
                pos[idx] = px;
                pos[idx + 1] = py;
                pos[idx + 2] = waveZ + bendZ;
            }
            thread.line.geometry.attributes.position.needsUpdate = true;
        });

        // Creative touch: Breathable camera orbit
        const cam = this.view.camera;
        const radius = 12;
        cam.position.x = Math.sin(elapsed * 0.15) * radius;
        cam.position.z = Math.cos(elapsed * 0.15) * radius;
        cam.position.y = Math.sin(elapsed * 0.1) * 2;
        cam.lookAt(0, 0, 0);

        this.view.render();
    }
}
