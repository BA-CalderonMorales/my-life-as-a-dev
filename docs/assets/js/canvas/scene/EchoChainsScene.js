import * as THREE from 'three';
import { ZenGeometryScene } from './ZenGeometryScene.js';
import {
    ZEN_CONNECTIONS,
    ZEN_NODE_DEFINITIONS
} from './ZenGeometryModel.js';

export class EchoChainsScene extends ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createGeometry() {
        const colors = this._getColors();

        // Keep base central form and 6 nodes
        const icoSize = this.isMobile ? 2.2 : 2.5;
        const icoGeo = new THREE.IcosahedronGeometry(icoSize, 1);
        const icoMat = new THREE.MeshPhysicalMaterial({
            color: colors.centralColor,
            metalness: 0.04,
            roughness: 0.56,
            transmission: 0.18,
            thickness: 0.8,
            ior: 1.12,
            transparent: true,
            opacity: 0.94,
            clearcoat: 0.08,
            clearcoatRoughness: 0.32,
            emissive: colors.glowColor,
            emissiveIntensity: 0.014,
        });
        this.centralForm = new THREE.Mesh(icoGeo, icoMat);
        this.centralForm.userData = {
            baseEmissive: 0.014,
            targetEmissive: 0.014,
        };
        this.scene.add(this.centralForm);

        const wireGeo = new THREE.IcosahedronGeometry(icoSize * 1.02, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: colors.lineColor,
            wireframe: true,
            transparent: true,
            opacity: 0.14,
        });
        const wireframe = new THREE.Mesh(wireGeo, wireMat);
        this.centralForm.add(wireframe);
        this.centralForm.userData.wireframe = wireframe;

        const nodeScale = this.isMobile ? 0.85 : this.isTablet ? 0.9 : 1;
        ZEN_NODE_DEFINITIONS.forEach((config) => {
            const geo = new THREE.OctahedronGeometry(config.size * nodeScale, 0);
            const mat = new THREE.MeshPhysicalMaterial({
                color: colors.nodeColor,
                metalness: 0.02,
                roughness: 0.72,
                emissive: colors.glowColor,
                emissiveIntensity: 0.03,
            });
            const node = new THREE.Mesh(geo, mat);
            const scaledPosition = config.position.map((value, index) =>
                index < 2 ? value * nodeScale : value
            );
            node.position.set(...scaledPosition);
            node.userData = {
                basePos: new THREE.Vector3(...scaledPosition),
                orbitSpeed: 0.05 + Math.random() * 0.04,
                orbitRadius: 0.18 + Math.random() * 0.2,
                phase: Math.random() * Math.PI * 2,
                floatSpeed: 0.12 + Math.random() * 0.16,
                baseEmissive: 0.03,
                targetEmissive: 0.03,
                breathePhase: Math.random() * Math.PI * 2,
                breatheSpeed: 0.22 + Math.random() * 0.28,
            };
            this.scene.add(node);
            this.nodes.push(node);
        });

        // Connections
        this._createConnections(colors);

        // Ring pool
        this.ringPool = [];
        this.activeRings = [];
        const poolSize = 20;
        const ringGeo = new THREE.TorusGeometry(1, 0.03, 8, 48);

        for (let i = 0; i < poolSize; i++) {
            const ringMat = new THREE.MeshBasicMaterial({
                color: colors.glowColor,
                transparent: true,
                opacity: 0,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.visible = false;
            ring.userData = { active: false, life: 0, maxLife: 3, origin: new THREE.Vector3() };
            this.scene.add(ring);
            this.ringPool.push(ring);
        }

        this.lastRingEmit = 0;
    }

    _createConnections(colors) {
        const lineMat = new THREE.LineBasicMaterial({
            color: colors.lineColor,
            transparent: true,
            opacity: 0.08,
        });

        ZEN_CONNECTIONS.forEach(([fromIdx, toIdx]) => {
            const points = [];
            const from = fromIdx === null ? new THREE.Vector3(0, 0, 0) : this.nodes[fromIdx].position;
            const to = this.nodes[toIdx].position;
            points.push(from.clone(), to.clone());

            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, lineMat.clone());
            line.userData = { fromIdx, toIdx, baseOpacity: 0.08, targetOpacity: 0.08 };
            this.scene.add(line);
            this.connections.push(line);
        });
    }

    _spawnRing(origin) {
        const ring = this.ringPool.find(r => !r.userData.active);
        if (!ring) return;

        ring.userData.active = true;
        ring.userData.life = 0;
        ring.userData.origin.copy(origin);
        ring.position.copy(origin);
        ring.scale.setScalar(0.1);
        ring.visible = true;
        ring.material.opacity = 0.4;
        this.activeRings.push(ring);
    }

    _updateTheme() {
        const colors = this._getColors();
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);

        this.centralForm.material.color.setHex(colors.centralColor);
        this.centralForm.material.emissive.setHex(colors.glowColor);
        this.centralForm.userData.wireframe.material.color.setHex(colors.lineColor);

        this.nodes.forEach(node => {
            node.material.color.setHex(colors.nodeColor);
            node.material.emissive.setHex(colors.glowColor);
        });

        this.connections.forEach(line => {
            line.material.color.setHex(colors.lineColor);
        });

        this.ringPool.forEach(ring => {
            ring.material.color.setHex(colors.glowColor);
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

            // Central form
            this.centralForm.rotation.x = elapsed * 0.02;
            this.centralForm.rotation.y = elapsed * 0.03;
            const breathe = 1 + Math.sin(elapsed * 0.45) * 0.01;
            this.centralForm.scale.setScalar(breathe);

            const centralData = this.centralForm.userData;
            if (this.isInteracting) {
                const distToCenter = this.mouse3D.length();
                if (distToCenter < 5) {
                    centralData.targetEmissive = 0.05 + (1 - distToCenter / 5) * 0.03;
                } else {
                    centralData.targetEmissive = 0.014;
                }
            } else {
                centralData.targetEmissive = 0.014;
            }
            centralData.baseEmissive += (centralData.targetEmissive - centralData.baseEmissive) * 0.04;
            this.centralForm.material.emissiveIntensity = centralData.baseEmissive;

            // Nodes
            this.nodes.forEach((node) => {
                const data = node.userData;
                node.position.x = data.basePos.x + Math.sin(elapsed * data.orbitSpeed + data.phase) * data.orbitRadius;
                node.position.y = data.basePos.y + Math.cos(elapsed * data.floatSpeed + data.phase) * data.orbitRadius * 0.5;
                node.position.z = data.basePos.z + Math.sin(elapsed * data.orbitSpeed * 0.7 + data.phase) * data.orbitRadius * 0.3;
                const nodeBreathe = 1 + Math.sin(elapsed * data.breatheSpeed + data.breathePhase) * 0.05;
                node.scale.setScalar(nodeBreathe);
                node.rotation.x = elapsed * 0.08;
                node.rotation.y = elapsed * 0.12;

                if (this.isInteracting) {
                    const distToMouse = node.position.distanceTo(this.mouse3D);
                    if (distToMouse < 3.5) {
                        data.targetEmissive = 0.07 + (1 - distToMouse / 3.5) * 0.05;
                    } else {
                        data.targetEmissive = 0.03;
                    }
                } else {
                    data.targetEmissive = 0.03;
                }
                data.baseEmissive += (data.targetEmissive - data.baseEmissive) * 0.08;
                node.material.emissiveIntensity = data.baseEmissive;
            });

            // Connections
            this.connections.forEach((line) => {
                const { fromIdx, toIdx } = line.userData;
                const positions = line.geometry.attributes.position.array;
                const from = fromIdx === null ? this.centralForm.position : this.nodes[fromIdx].position;
                const to = this.nodes[toIdx].position;
                positions[0] = from.x;
                positions[1] = from.y;
                positions[2] = from.z;
                positions[3] = to.x;
                positions[4] = to.y;
                positions[5] = to.z;
                line.geometry.attributes.position.needsUpdate = true;

                const fromEmissive = fromIdx === null ? this.centralForm.userData.baseEmissive : this.nodes[fromIdx].userData.baseEmissive;
                const toEmissive = this.nodes[toIdx].userData.baseEmissive;
                const lineGlow = Math.max(fromEmissive, toEmissive);
                line.userData.targetOpacity = 0.08 + lineGlow * 0.18;
                line.userData.baseOpacity += (line.userData.targetOpacity - line.userData.baseOpacity) * 0.1;
                line.material.opacity = line.userData.baseOpacity;
            });

            // Emit rings every 2 seconds
            if (elapsed - this.lastRingEmit > 2.0) {
                this.lastRingEmit = elapsed;
                this._spawnRing(new THREE.Vector3(0, 0, 0));
                this.nodes.forEach(node => this._spawnRing(node.position));
            }

            // Update active rings
            for (let i = this.activeRings.length - 1; i >= 0; i--) {
                const ring = this.activeRings[i];
                const data = ring.userData;
                data.life += 0.016; // approx 60fps

                const progress = data.life / data.maxLife;
                if (progress >= 1) {
                    data.active = false;
                    ring.visible = false;
                    ring.material.opacity = 0;
                    this.activeRings.splice(i, 1);
                    continue;
                }

                const scale = 0.1 + progress * 8;
                ring.scale.setScalar(scale);
                ring.material.opacity = 0.4 * (1 - progress);
                ring.position.copy(data.origin);
            }

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }
}
