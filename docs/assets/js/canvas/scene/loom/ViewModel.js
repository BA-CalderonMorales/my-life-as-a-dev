/**
 * Loom ViewModel - Core Behavioral Logic
 * 
 * Orchestrates grid generation, wave interference physics, 
 * and interactive "bending" logic.
 */
import * as THREE from 'three';
import { LOOM_CONFIG, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = LOOM_CONFIG;
        this.isMobile = isMobile;

        this.startTime = performance.now();
        this.mouse3D = new THREE.Vector3(0, 0, 0);
        this.isInteracting = false;
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    init() {
        const colors = getColors();
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        this.view.init(colors, perf);

        // Behavior: Generate horizontal and vertical "threads"
        this._generateThreads('horizontal', perf, colors.lineColor, this.config.physics.primaryOpacity);
        this._generateThreads('vertical', perf, colors.nodeColor, this.config.physics.secondaryOpacity);
    }

    _generateThreads(type, perf, color, opacity) {
        const count = type === 'horizontal' ? perf.horizontalCount : perf.verticalCount;
        const extent = (count - 1) * perf.spacing / 2;

        for (let i = 0; i < count; i++) {
            const fixed = (i * perf.spacing) - extent;
            this.view.addThread(type, fixed, perf.segments, extent, color, opacity);
        }
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
        const cfg = this.config.physics;

        // Behavior: Orchestrate wave interference and interaction bending
        this.view.threads.forEach(thread => {
            const pos = thread.line.geometry.attributes.position.array;
            const isHorizontal = thread.type === 'horizontal';

            for (let j = 0; j <= thread.segments; j++) {
                const t = j / thread.segments;
                const moving = t * thread.extent * 2 - thread.extent;
                const px = isHorizontal ? moving : thread.fixed;
                const py = isHorizontal ? thread.fixed : moving;
                
                // Behavior: Primary wave interference
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

        // Behavior: Breathable camera orbit
        const cam = this.view.camera;
        const radius = 12;
        cam.position.x = Math.sin(elapsed * 0.15) * radius;
        cam.position.z = Math.cos(elapsed * 0.15) * radius;
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
