import * as THREE from 'three';
import { ZenGeometryScene } from './ZenGeometryScene.js';

export class TheLoomScene extends ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createGeometry() {
        const colors = this._getColors();

        this.threads = [];

        const hCount = 20;
        const vCount = 20;
        const spacing = this.isMobile ? 0.7 : 0.5;
        const extent = (Math.max(hCount, vCount) - 1) * spacing / 2;

        // Horizontal threads (vary along X, fixed Y)
        for (let i = 0; i < hCount; i++) {
            const y = (i * spacing) - ((hCount - 1) * spacing) / 2;
            const points = [];
            const segments = this.isMobile ? 30 : 50;
            for (let j = 0; j <= segments; j++) {
                const x = (j / segments) * extent * 2 - extent;
                points.push(new THREE.Vector3(x, y, 0));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
                color: colors.lineColor,
                transparent: true,
                opacity: 0.35,
            });
            const line = new THREE.Line(geo, mat);
            line.userData = {
                type: 'horizontal',
                baseY: y,
                index: i,
                segments: segments,
                extent: extent,
            };
            this.scene.add(line);
            this.threads.push(line);
        }

        // Vertical threads (vary along Y, fixed X)
        for (let i = 0; i < vCount; i++) {
            const x = (i * spacing) - ((vCount - 1) * spacing) / 2;
            const points = [];
            const segments = this.isMobile ? 30 : 50;
            for (let j = 0; j <= segments; j++) {
                const y = (j / segments) * extent * 2 - extent;
                points.push(new THREE.Vector3(x, y, 0));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
                color: colors.nodeColor,
                transparent: true,
                opacity: 0.35,
            });
            const line = new THREE.Line(geo, mat);
            line.userData = {
                type: 'vertical',
                baseX: x,
                index: i,
                segments: segments,
                extent: extent,
            };
            this.scene.add(line);
            this.threads.push(line);
        }
    }

    _updateTheme() {
        const colors = this._getColors();
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);

        this.threads.forEach(thread => {
            if (thread.userData.type === 'horizontal') {
                thread.material.color.setHex(colors.lineColor);
            } else {
                thread.material.color.setHex(colors.nodeColor);
            }
        });
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();
            const timeSinceInteraction = elapsed - this.lastInteraction;
            const interactionFade = Math.max(0, 1 - timeSinceInteraction / 2.4);

            // Camera
            const camDistance = this.camera.userData.baseDistance;
            const camSpeed = 0.018;
            const autoAngle = elapsed * camSpeed;
            const totalAngle = autoAngle + this.orbitAngle;
            let camX = Math.sin(totalAngle) * camDistance;
            let camZ = Math.cos(totalAngle) * camDistance;
            let camY = Math.sin(elapsed * camSpeed * 0.4) * 1.4 + this.orbitTilt * camDistance * 0.24;

            if (this.isInteracting && !this.isTouching && !this.isPinching && interactionFade > 0) {
                camX += this.mouse3D.x * 0.5 * interactionFade;
                camY += this.mouse3D.y * 0.3 * interactionFade;
            }

            this.camera.position.set(camX, camY, camZ);
            this.camera.lookAt(0, 0, 0);

            // Update threads
            this.threads.forEach((thread) => {
                const data = thread.userData;
                const positions = thread.geometry.attributes.position.array;
                const segments = data.segments;
                const extent = data.extent;

                for (let j = 0; j <= segments; j++) {
                    const t = j / segments;
                    let px, py;

                    if (data.type === 'horizontal') {
                        px = t * extent * 2 - extent;
                        py = data.baseY;
                    } else {
                        px = data.baseX;
                        py = t * extent * 2 - extent;
                    }

                    // Subtle wave motion across grid
                    const waveZ = Math.sin(px * 0.8 + elapsed * 1.2) * Math.cos(py * 0.8 + elapsed * 0.8) * 0.15;

                    // Mouse interaction: bend toward Z
                    let bendZ = 0;
                    if (this.isInteracting && interactionFade > 0) {
                        const dx = px - this.mouse3D.x;
                        const dy = py - this.mouse3D.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const influenceRadius = 4.0;
                        if (dist < influenceRadius) {
                            const factor = (1 - dist / influenceRadius) * interactionFade;
                            bendZ = Math.sin(factor * Math.PI) * 1.2;
                        }
                    }

                    const idx = j * 3;
                    positions[idx] = px;
                    positions[idx + 1] = py;
                    positions[idx + 2] = waveZ + bendZ;
                }

                thread.geometry.attributes.position.needsUpdate = true;
            });

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }
}
