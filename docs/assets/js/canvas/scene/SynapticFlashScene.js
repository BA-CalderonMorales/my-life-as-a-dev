import * as THREE from 'three';
import { ZenGeometryScene } from './ZenGeometryScene.js';

export class SynapticFlashScene extends ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createGeometry() {
        const colors = this._getColors();
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';

        this.synapticNodes = [];
        this.synapticConnections = [];
        this.pulses = [];

        const nodeCount = 30;
        const sphereSize = this.isMobile ? 0.14 : 0.12;

        // Generate branching tree positions
        const positions = [];
        positions.push(new THREE.Vector3(0, 0, 0)); // root

        for (let i = 1; i < nodeCount; i++) {
            const parentIdx = Math.floor(Math.random() * i);
            const parentPos = positions[parentIdx];
            const dir = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
            const dist = 1.5 + Math.random() * 2.5;
            const pos = parentPos.clone().add(dir.multiplyScalar(dist));
            positions.push(pos);
        }

        const geo = new THREE.SphereGeometry(sphereSize, 12, 12);
        const mat = new THREE.MeshPhysicalMaterial({
            color: colors.nodeColor,
            metalness: 0.04,
            roughness: 0.6,
            emissive: colors.glowColor,
            emissiveIntensity: 0.08,
        });

        positions.forEach((pos, i) => {
            const mesh = new THREE.Mesh(geo, mat.clone());
            mesh.position.copy(pos);
            mesh.userData = {
                baseEmissive: 0.08,
                targetEmissive: 0.08,
                currentEmissive: 0.08,
                index: i,
            };
            this.scene.add(mesh);
            this.synapticNodes.push(mesh);
        });

        // Connections: connect each node to a random earlier node (tree)
        const lineMat = new THREE.LineBasicMaterial({
            color: colors.lineColor,
            transparent: true,
            opacity: 0.15,
        });

        for (let i = 1; i < nodeCount; i++) {
            const parentIdx = Math.floor(Math.random() * i);
            const points = [positions[parentIdx].clone(), positions[i].clone()];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, lineMat.clone());
            line.userData = {
                fromIdx: parentIdx,
                toIdx: i,
                baseOpacity: 0.15,
                targetOpacity: 0.15,
                currentOpacity: 0.15,
            };
            this.scene.add(line);
            this.synapticConnections.push(line);
        }

        // Extra connections for network feel
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dist = positions[i].distanceTo(positions[j]);
                if (dist < 3.5 && Math.random() < 0.15) {
                    const points = [positions[i].clone(), positions[j].clone()];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(lineGeo, lineMat.clone());
                    line.userData = {
                        fromIdx: i,
                        toIdx: j,
                        baseOpacity: 0.08,
                        targetOpacity: 0.08,
                        currentOpacity: 0.08,
                    };
                    this.scene.add(line);
                    this.synapticConnections.push(line);
                }
            }
        }

        this.nextPulseTime = 0.8 + Math.random() * 0.7;
        this.pulseDecay = 0.5; // seconds
    }

    _updateTheme() {
        const colors = this._getColors();
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);

        this.synapticNodes.forEach(node => {
            node.material.color.setHex(colors.nodeColor);
            node.material.emissive.setHex(colors.glowColor);
        });

        this.synapticConnections.forEach(line => {
            line.material.color.setHex(colors.lineColor);
        });
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();
            const delta = this.clock.getDelta();
            const timeSinceInteraction = elapsed - this.lastInteraction;
            const interactionFade = Math.max(0, 1 - timeSinceInteraction / 2.4);

            // Camera orbit
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

            // Emit pulses
            if (elapsed >= this.nextPulseTime) {
                this.nextPulseTime = elapsed + 0.8 + Math.random() * 0.7;
                this._emitPulse(0); // from center
            }

            // Update pulses
            for (let i = this.pulses.length - 1; i >= 0; i--) {
                const pulse = this.pulses[i];
                pulse.age += 0.016;

                if (pulse.age >= this.pulseDecay) {
                    // Pulse finished
                    this.pulses.splice(i, 1);
                    continue;
                }

                const intensity = 1 - (pulse.age / this.pulseDecay);
                const node = this.synapticNodes[pulse.nodeIdx];
                const brightEmissive = 0.6 * intensity;
                if (brightEmissive > node.userData.targetEmissive) {
                    node.userData.targetEmissive = brightEmissive;
                }

                // Brighten connected lines
                this.synapticConnections.forEach(line => {
                    if (line.userData.fromIdx === pulse.nodeIdx || line.userData.toIdx === pulse.nodeIdx) {
                        const brightOpacity = line.userData.baseOpacity + 0.4 * intensity;
                        if (brightOpacity > line.userData.targetOpacity) {
                            line.userData.targetOpacity = brightOpacity;
                        }
                    }
                });

                // Propagate to neighbors occasionally
                if (pulse.age > 0.1 && !pulse.propagated && Math.random() < 0.4) {
                    pulse.propagated = true;
                    const neighbors = [];
                    this.synapticConnections.forEach(line => {
                        if (line.userData.fromIdx === pulse.nodeIdx) neighbors.push(line.userData.toIdx);
                        if (line.userData.toIdx === pulse.nodeIdx) neighbors.push(line.userData.fromIdx);
                    });
                    if (neighbors.length > 0) {
                        const nextIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
                        this.pulses.push({ nodeIdx: nextIdx, age: 0, propagated: false });
                    }
                }
            }

            // Update node emissive decay
            this.synapticNodes.forEach((node) => {
                const data = node.userData;
                data.targetEmissive = Math.max(data.baseEmissive, data.targetEmissive * 0.92);
                data.currentEmissive += (data.targetEmissive - data.currentEmissive) * 0.15;
                node.material.emissiveIntensity = data.currentEmissive;

                // Subtle idle float
                node.position.y += Math.sin(elapsed * 0.5 + data.index) * 0.001;
            });

            // Update connection opacity decay
            this.synapticConnections.forEach((line) => {
                const data = line.userData;
                data.targetOpacity = Math.max(data.baseOpacity, data.targetOpacity * 0.92);
                data.currentOpacity += (data.targetOpacity - data.currentOpacity) * 0.15;
                line.material.opacity = data.currentOpacity;

                // Update geometry positions
                const positions = line.geometry.attributes.position.array;
                const from = this.synapticNodes[data.fromIdx].position;
                const to = this.synapticNodes[data.toIdx].position;
                positions[0] = from.x;
                positions[1] = from.y;
                positions[2] = from.z;
                positions[3] = to.x;
                positions[4] = to.y;
                positions[5] = to.z;
                line.geometry.attributes.position.needsUpdate = true;
            });

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    _emitPulse(nodeIdx) {
        this.pulses.push({ nodeIdx, age: 0, propagated: false });
    }
}
