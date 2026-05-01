import * as THREE from 'three';
import { ZenGeometryScene } from './ZenGeometryScene.js';

export class QuantumLatticeScene extends ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createGeometry() {
        const colors = this._getColors();
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';

        this.latticeNodes = [];
        this.latticeConnections = [];

        const gridSize = this.isMobile ? 5 : 8;
        const spacing = this.isMobile ? 1.6 : 1.4;
        const octaSize = this.isMobile ? 0.12 : 0.1;
        const emissiveBase = isDark ? 0.35 : 0.25;

        const geo = new THREE.OctahedronGeometry(octaSize, 0);
        const mat = new THREE.MeshPhysicalMaterial({
            color: colors.nodeColor,
            metalness: 0.08,
            roughness: 0.5,
            emissive: colors.glowColor,
            emissiveIntensity: emissiveBase,
        });

        const offset = ((gridSize - 1) * spacing) / 2;

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const mesh = new THREE.Mesh(geo, mat.clone());
                    const bx = x * spacing - offset;
                    const by = y * spacing - offset;
                    const bz = z * spacing - offset;
                    mesh.position.set(bx, by, bz);
                    mesh.userData = {
                        basePos: new THREE.Vector3(bx, by, bz),
                        phase: Math.random() * Math.PI * 2,
                        snapSpeed: 8 + Math.random() * 12,
                        snapAmp: 0.04 + Math.random() * 0.06,
                    };
                    this.scene.add(mesh);
                    this.latticeNodes.push(mesh);
                }
            }
        }

        // Connect nearest neighbors
        const lineMat = new THREE.LineBasicMaterial({
            color: colors.lineColor,
            transparent: true,
            opacity: 0.12,
        });

        const posMap = new Map();
        this.latticeNodes.forEach((node, idx) => {
            const key = `${Math.round(node.userData.basePos.x / spacing)},${Math.round(node.userData.basePos.y / spacing)},${Math.round(node.userData.basePos.z / spacing)}`;
            posMap.set(key, idx);
        });

        const added = new Set();
        this.latticeNodes.forEach((node, idx) => {
            const bx = node.userData.basePos.x;
            const by = node.userData.basePos.y;
            const bz = node.userData.basePos.z;
            const ix = Math.round(bx / spacing);
            const iy = Math.round(by / spacing);
            const iz = Math.round(bz / spacing);

            const neighbors = [
                [1, 0, 0], [-1, 0, 0],
                [0, 1, 0], [0, -1, 0],
                [0, 0, 1], [0, 0, -1],
            ];

            for (const [dx, dy, dz] of neighbors) {
                const key = `${ix + dx},${iy + dy},${iz + dz}`;
                const otherIdx = posMap.get(key);
                if (otherIdx === undefined) continue;
                const pair = [Math.min(idx, otherIdx), Math.max(idx, otherIdx)].join('-');
                if (added.has(pair)) continue;
                added.add(pair);

                const points = [node.position.clone(), this.latticeNodes[otherIdx].position.clone()];
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeo, lineMat.clone());
                line.userData = { fromIdx: idx, toIdx: otherIdx };
                this.scene.add(line);
                this.latticeConnections.push(line);
            }
        });
    }

    _updateTheme() {
        const colors = this._getColors();
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);

        this.latticeNodes.forEach(node => {
            node.material.color.setHex(colors.nodeColor);
            node.material.emissive.setHex(colors.glowColor);
        });

        this.latticeConnections.forEach(line => {
            line.material.color.setHex(colors.lineColor);
        });
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();

            // Faster camera auto-rotation
            const camDistance = this.camera.userData.baseDistance;
            const camSpeed = 0.045;
            const autoAngle = elapsed * camSpeed;
            const totalAngle = autoAngle + this.orbitAngle;
            let camX = Math.sin(totalAngle) * camDistance;
            let camZ = Math.cos(totalAngle) * camDistance;
            let camY = Math.sin(elapsed * camSpeed * 0.4) * 1.4 + this.orbitTilt * camDistance * 0.24;

            this.camera.position.set(camX, camY, camZ);
            this.camera.lookAt(0, 0, 0);

            // Snap jitter on nodes
            this.latticeNodes.forEach((node) => {
                const data = node.userData;
                const t = elapsed * data.snapSpeed + data.phase;
                node.position.x = data.basePos.x + Math.sin(t) * data.snapAmp;
                node.position.y = data.basePos.y + Math.sin(t * 1.3 + data.phase) * data.snapAmp;
                node.position.z = data.basePos.z + Math.sin(t * 0.9 + data.phase * 2) * data.snapAmp;
                node.rotation.x = elapsed * 0.5 + data.phase;
                node.rotation.y = elapsed * 0.3;
            });

            // Update connection lines
            this.latticeConnections.forEach((line) => {
                const { fromIdx, toIdx } = line.userData;
                const positions = line.geometry.attributes.position.array;
                const from = this.latticeNodes[fromIdx].position;
                const to = this.latticeNodes[toIdx].position;
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
}
