import * as THREE from 'three';
import { ZenGeometryScene } from './ZenGeometryScene.js';

export class QuantumLatticeScene extends ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.latticeNodes = null;
        this.latticeLines = null;
        this.latticeBasePositions = null;
        this.latticeCurrentPositions = null;
        this.latticePhases = null;
        this.latticeSpeeds = null;
        this.latticeAmplitudes = null;
        this.latticeEdges = null;
        this.matrixObject = new THREE.Object3D();
    }

    _createGeometry() {
        const colors = this._getColors();
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';

        const gridSize = this.isMobile ? 5 : this.isTablet ? 6 : 7;
        const spacing = this.isMobile ? 1.55 : 1.48;
        const octaSize = this.isMobile ? 0.13 : 0.115;
        const nodeCount = gridSize * gridSize * gridSize;
        const emissiveBase = isDark ? 0.42 : 0.28;
        const nodeGeometry = new THREE.OctahedronGeometry(octaSize, 0);
        const nodeMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.nodeColor,
            metalness: 0.08,
            roughness: 0.5,
            emissive: colors.glowColor,
            emissiveIntensity: emissiveBase,
            vertexColors: true,
        });

        const offset = ((gridSize - 1) * spacing) / 2;
        const baseColor = new THREE.Color(colors.nodeColor);
        const accentColor = new THREE.Color(colors.glowColor);
        const instanceColor = new THREE.Color();

        this.latticeNodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);
        this.latticeNodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.latticeBasePositions = new Float32Array(nodeCount * 3);
        this.latticeCurrentPositions = new Float32Array(nodeCount * 3);
        this.latticePhases = new Float32Array(nodeCount);
        this.latticeSpeeds = new Float32Array(nodeCount);
        this.latticeAmplitudes = new Float32Array(nodeCount);

        let nodeIndex = 0;

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const bx = x * spacing - offset;
                    const by = y * spacing - offset;
                    const bz = z * spacing - offset;
                    const idx = nodeIndex * 3;

                    this.latticeBasePositions[idx] = bx;
                    this.latticeBasePositions[idx + 1] = by;
                    this.latticeBasePositions[idx + 2] = bz;
                    this.latticeCurrentPositions[idx] = bx;
                    this.latticeCurrentPositions[idx + 1] = by;
                    this.latticeCurrentPositions[idx + 2] = bz;
                    this.latticePhases[nodeIndex] = Math.random() * Math.PI * 2;
                    this.latticeSpeeds[nodeIndex] = 6 + Math.random() * 9;
                    this.latticeAmplitudes[nodeIndex] = 0.035 + Math.random() * 0.055;

                    instanceColor.copy(baseColor).lerp(accentColor, 0.12 + Math.random() * 0.3);
                    this.latticeNodes.setColorAt(nodeIndex, instanceColor);
                    this.matrixObject.position.set(bx, by, bz);
                    this.matrixObject.rotation.set(0, 0, 0);
                    this.matrixObject.scale.setScalar(1);
                    this.matrixObject.updateMatrix();
                    this.latticeNodes.setMatrixAt(nodeIndex, this.matrixObject.matrix);
                    nodeIndex++;
                }
            }
        }

        this.scene.add(this.latticeNodes);

        const indexFor = (x, y, z) => x * gridSize * gridSize + y * gridSize + z;
        const edgePairs = [];

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const from = indexFor(x, y, z);
                    if (x + 1 < gridSize) edgePairs.push(from, indexFor(x + 1, y, z));
                    if (y + 1 < gridSize) edgePairs.push(from, indexFor(x, y + 1, z));
                    if (z + 1 < gridSize) edgePairs.push(from, indexFor(x, y, z + 1));
                }
            }
        }

        this.latticeEdges = new Uint16Array(edgePairs);
        const linePositions = new Float32Array((edgePairs.length / 2) * 6);
        const linePositionAttribute = new THREE.BufferAttribute(linePositions, 3);
        linePositionAttribute.setUsage(THREE.DynamicDrawUsage);

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', linePositionAttribute);

        const lineMat = new THREE.LineBasicMaterial({
            color: colors.lineColor,
            transparent: true,
            opacity: isDark ? 0.2 : 0.14,
        });

        this.latticeLines = new THREE.LineSegments(lineGeometry, lineMat);
        this.scene.add(this.latticeLines);
        this._updateLinePositions();
    }

    _updateTheme() {
        const colors = this._getColors();
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);

        if (this.latticeNodes) {
            this.latticeNodes.material.color.setHex(colors.nodeColor);
            this.latticeNodes.material.emissive.setHex(colors.glowColor);

            const baseColor = new THREE.Color(colors.nodeColor);
            const accentColor = new THREE.Color(colors.glowColor);
            const instanceColor = new THREE.Color();
            const count = this.latticeBasePositions.length / 3;

            for (let i = 0; i < count; i++) {
                const phaseMix = 0.12 + (Math.sin(this.latticePhases[i]) * 0.5 + 0.5) * 0.3;
                instanceColor.copy(baseColor).lerp(accentColor, phaseMix);
                this.latticeNodes.setColorAt(i, instanceColor);
            }

            if (this.latticeNodes.instanceColor) {
                this.latticeNodes.instanceColor.needsUpdate = true;
            }
        }

        if (this.latticeLines) {
            this.latticeLines.material.color.setHex(colors.lineColor);
        }
    }

    _updateLinePositions() {
        if (!this.latticeLines || !this.latticeEdges) return;

        const linePositions = this.latticeLines.geometry.attributes.position.array;
        let writeIndex = 0;

        for (let i = 0; i < this.latticeEdges.length; i += 2) {
            const fromIdx = this.latticeEdges[i] * 3;
            const toIdx = this.latticeEdges[i + 1] * 3;

            linePositions[writeIndex++] = this.latticeCurrentPositions[fromIdx];
            linePositions[writeIndex++] = this.latticeCurrentPositions[fromIdx + 1];
            linePositions[writeIndex++] = this.latticeCurrentPositions[fromIdx + 2];
            linePositions[writeIndex++] = this.latticeCurrentPositions[toIdx];
            linePositions[writeIndex++] = this.latticeCurrentPositions[toIdx + 1];
            linePositions[writeIndex++] = this.latticeCurrentPositions[toIdx + 2];
        }

        this.latticeLines.geometry.attributes.position.needsUpdate = true;
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();

            const camDistance = this.camera.userData.baseDistance;
            const camSpeed = 0.032;
            const autoAngle = elapsed * camSpeed;
            const totalAngle = autoAngle + this.orbitAngle;
            const camX = Math.sin(totalAngle) * camDistance;
            const camZ = Math.cos(totalAngle) * camDistance;
            const camY = Math.sin(elapsed * camSpeed * 0.4) * 1.4 + this.orbitTilt * camDistance * 0.24;

            this.camera.position.set(camX, camY, camZ);
            this.camera.lookAt(0, 0, 0);

            const count = this.latticeBasePositions.length / 3;
            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                const phase = this.latticePhases[i];
                const speed = this.latticeSpeeds[i];
                const amp = this.latticeAmplitudes[i];
                const t = elapsed * speed + phase;
                const snap = Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), 0.28);
                const shimmer = Math.sin(t * 0.37 + phase);
                const x = this.latticeBasePositions[idx] + snap * amp;
                const y = this.latticeBasePositions[idx + 1] + Math.sin(t * 1.21 + phase) * amp;
                const z = this.latticeBasePositions[idx + 2] + Math.cos(t * 0.83 + phase * 2) * amp;

                this.latticeCurrentPositions[idx] = x;
                this.latticeCurrentPositions[idx + 1] = y;
                this.latticeCurrentPositions[idx + 2] = z;

                this.matrixObject.position.set(x, y, z);
                this.matrixObject.rotation.set(elapsed * 0.42 + phase, elapsed * 0.26, shimmer * 0.4);
                this.matrixObject.scale.setScalar(0.92 + shimmer * 0.08);
                this.matrixObject.updateMatrix();
                this.latticeNodes.setMatrixAt(i, this.matrixObject.matrix);
            }

            this.latticeNodes.instanceMatrix.needsUpdate = true;
            this.latticeNodes.material.emissiveIntensity = (document.body.getAttribute('data-md-color-scheme') === 'slate' ? 0.42 : 0.28)
                + Math.sin(elapsed * 2.4) * 0.04;
            this.latticeLines.material.opacity = (document.body.getAttribute('data-md-color-scheme') === 'slate' ? 0.2 : 0.14)
                + Math.sin(elapsed * 1.6) * 0.025;
            this._updateLinePositions();

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }
}
