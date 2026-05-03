import * as THREE from 'three';
import { ZenGeometryScene } from './ZenGeometryScene.js';

export class OrigamiUnfoldingScene extends ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createGeometry() {
        const colors = this._getColors();

        this.planes = [];
        this.planeConnections = [];

        const planeSize = this.isMobile ? 2.2 : 3.0;
        const geo = new THREE.BufferGeometry();
        const half = planeSize / 2;
        const vertices = new Float32Array([
            0, half, 0,
            -half, -half, 0,
            half, -half, 0,
        ]);
        geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geo.computeVertexNormals();

        // Dodecahedron face normals as plane orientations
        const phi = (1 + Math.sqrt(5)) / 2;
        const normals = [
            [0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
            [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
            [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1],
        ];

        normals.forEach((n, i) => {
            const normal = new THREE.Vector3(...n).normalize();
            const mat = new THREE.MeshPhysicalMaterial({
                color: colors.centralColor,
                metalness: 0.02,
                roughness: 0.6,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
                emissive: colors.glowColor,
                emissiveIntensity: 0.04,
            });
            const mesh = new THREE.Mesh(geo, mat);
            const dist = this.isMobile ? 3.5 : 4.5;
            mesh.position.copy(normal.clone().multiplyScalar(dist));
            mesh.lookAt(0, 0, 0);
            mesh.userData = {
                baseNormal: normal.clone(),
                basePos: mesh.position.clone(),
                rotationSpeed: 0.15 + Math.random() * 0.25,
                phase: Math.random() * Math.PI * 2,
                axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
            };
            this.scene.add(mesh);
            this.planes.push(mesh);
        });

        // Thin lines between plane centers
        const lineMat = new THREE.LineBasicMaterial({
            color: colors.lineColor,
            transparent: true,
            opacity: 0.1,
        });

        for (let i = 0; i < this.planes.length; i++) {
            for (let j = i + 1; j < this.planes.length; j++) {
                const dist = this.planes[i].position.distanceTo(this.planes[j].position);
                if (dist < (this.isMobile ? 6 : 8)) {
                    const points = [
                        this.planes[i].position.clone(),
                        this.planes[j].position.clone(),
                    ];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(lineGeo, lineMat.clone());
                    line.userData = { fromIdx: i, toIdx: j };
                    this.scene.add(line);
                    this.planeConnections.push(line);
                }
            }
        }
    }

    _updateTheme() {
        const colors = this._getColors();
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);

        this.planes.forEach(plane => {
            plane.material.color.setHex(colors.centralColor);
            plane.material.emissive.setHex(colors.glowColor);
        });

        this.planeConnections.forEach(line => {
            line.material.color.setHex(colors.lineColor);
        });
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();
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

            // Interaction: find cursor direction from center
            const cursorDir = this.mouse3D.clone().normalize();
            if (this.mouse3D.length() < 0.1) cursorDir.set(0, 0, 1);

            this.planes.forEach((plane, i) => {
                const data = plane.userData;

                // Self rotation
                plane.rotateOnAxis(data.axis, data.rotationSpeed * 0.008);

                // Fold toward cursor if close
                let foldFactor = 0;
                if (this.isInteracting) {
                    const planeDir = data.baseNormal.clone();
                    const dot = planeDir.dot(cursorDir);
                    if (dot > 0.3) {
                        foldFactor = (dot - 0.3) / 0.7;
                    }
                }

                const targetPos = data.basePos.clone().lerp(
                    data.basePos.clone().multiplyScalar(0.6),
                    foldFactor * interactionFade
                );
                plane.position.lerp(targetPos, 0.06);
            });

            // Update connection lines
            this.planeConnections.forEach((line) => {
                const { fromIdx, toIdx } = line.userData;
                const positions = line.geometry.attributes.position.array;
                const from = this.planes[fromIdx].position;
                const to = this.planes[toIdx].position;
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
