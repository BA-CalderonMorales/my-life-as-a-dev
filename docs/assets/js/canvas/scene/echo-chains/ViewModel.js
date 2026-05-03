import * as THREE from 'three';

export class ViewModel {
    constructor(view, nodeDefinitions, connections) {
        this.view = view;
        this.nodeDefinitions = nodeDefinitions;
        this.connections = connections;

        this.mouse = new THREE.Vector2(-1000, -1000);
        this.mouse3D = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.isInteracting = false;

        this.nodeStates = this.nodeDefinitions.map(config => ({
            basePos: new THREE.Vector3(...config.position),
            currentPos: new THREE.Vector3(...config.position),
            orbitSpeed: 0.05 + Math.random() * 0.04,
            orbitRadius: 0.18 + Math.random() * 0.2,
            phase: Math.random() * Math.PI * 2,
            floatSpeed: 0.12 + Math.random() * 0.16,
            emissive: 0.03,
            targetEmissive: 0.03,
            breathePhase: Math.random() * Math.PI * 2,
            breatheSpeed: 0.22 + Math.random() * 0.28,
            scale: config.size
        }));

        this.centralState = {
            baseEmissive: 0.014,
            targetEmissive: 0.014
        };

        this.lastRingEmit = 0;
        this.activeRings = [];
        this.clock = new THREE.Clock();
    }

    update() {
        const elapsed = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();

        this._updateCamera(elapsed);
        this._updateCentralForm(elapsed);
        this._updateNodes(elapsed);
        this._updateConnections();
        this._updateRings(elapsed, delta);
        
        this.view.render();
    }

    _updateCamera(elapsed) {
        const camDistance = this.view.camera.userData.baseDistance;
        const camSpeed = 0.018;
        const totalAngle = elapsed * camSpeed;
        const camX = Math.sin(totalAngle) * camDistance;
        const camZ = Math.cos(totalAngle) * camDistance;
        const camY = Math.sin(elapsed * camSpeed * 0.4) * 1.4;

        this.view.camera.position.set(camX, camY, camZ);
        this.view.camera.lookAt(0, 0, 0);
    }

    _updateCentralForm(elapsed) {
        this.view.centralForm.rotation.x = elapsed * 0.02;
        this.view.centralForm.rotation.y = elapsed * 0.03;
        const breathe = 1 + Math.sin(elapsed * 0.45) * 0.01;
        this.view.centralForm.scale.setScalar(breathe);

        if (this.isInteracting) {
            const distToCenter = this.mouse3D.length();
            this.centralState.targetEmissive = distToCenter < 5 ? 0.05 + (1 - distToCenter / 5) * 0.03 : 0.014;
        } else {
            this.centralState.targetEmissive = 0.014;
        }
        this.centralState.baseEmissive += (this.centralState.targetEmissive - this.centralState.baseEmissive) * 0.04;
        this.view.centralForm.material.emissiveIntensity = this.centralState.baseEmissive;
    }

    _updateNodes(elapsed) {
        const matrix = new THREE.Matrix4();
        const nodeScaleFactor = this.view.isMobile ? 0.85 : 1;

        this.nodeStates.forEach((state, i) => {
            state.currentPos.x = state.basePos.x + Math.sin(elapsed * state.orbitSpeed + state.phase) * state.orbitRadius;
            state.currentPos.y = state.basePos.y + Math.cos(elapsed * state.floatSpeed + state.phase) * state.orbitRadius * 0.5;
            state.currentPos.z = state.basePos.z + Math.sin(elapsed * state.orbitSpeed * 0.7 + state.phase) * state.orbitRadius * 0.3;

            const nodeBreathe = 1 + Math.sin(elapsed * state.breatheSpeed + state.breathePhase) * 0.05;
            const finalScale = state.scale * nodeScaleFactor * nodeBreathe;

            if (this.isInteracting) {
                const distToMouse = state.currentPos.distanceTo(this.mouse3D);
                state.targetEmissive = distToMouse < 3.5 ? 0.07 + (1 - distToMouse / 3.5) * 0.05 : 0.03;
            } else {
                state.targetEmissive = 0.03;
            }
            state.emissive += (state.targetEmissive - state.emissive) * 0.08;

            matrix.makeScale(finalScale, finalScale, finalScale);
            matrix.setPosition(state.currentPos);
            this.view.nodes.setMatrixAt(i, matrix);
        });
        this.view.nodes.instanceMatrix.needsUpdate = true;
    }

    _updateConnections() {
        this.view.connections.forEach((line) => {
            const { fromIdx, toIdx } = line.userData;
            const positions = line.geometry.attributes.position.array;
            const from = fromIdx === null ? this.view.centralForm.position : this.nodeStates[fromIdx].currentPos;
            const to = this.nodeStates[toIdx].currentPos;
            
            positions[0] = from.x;
            positions[1] = from.y;
            positions[2] = from.z;
            positions[3] = to.x;
            positions[4] = to.y;
            positions[5] = to.z;
            line.geometry.attributes.position.needsUpdate = true;

            const fromEm = fromIdx === null ? this.centralState.baseEmissive : this.nodeStates[fromIdx].emissive;
            const toEm = this.nodeStates[toIdx].emissive;
            const lineGlow = Math.max(fromEm, toEm);
            line.userData.targetOpacity = 0.08 + lineGlow * 0.18;
            line.userData.baseOpacity += (line.userData.targetOpacity - line.userData.baseOpacity) * 0.1;
            line.material.opacity = line.userData.baseOpacity;
        });
    }

    _updateRings(elapsed, delta) {
        if (elapsed - this.lastRingEmit > 2.0) {
            this.lastRingEmit = elapsed;
            this._spawnRing(new THREE.Vector3(0, 0, 0));
            this.nodeStates.forEach(state => this._spawnRing(state.currentPos));
        }

        for (let i = this.activeRings.length - 1; i >= 0; i--) {
            const ring = this.activeRings[i];
            const data = ring.userData;
            data.life += 0.016; // Fix to 60fps for stability

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
    }

    _spawnRing(origin) {
        const ring = this.view.ringPool.find(r => !r.userData.active);
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

    handleMouseMove(x, y) {
        this.mouse.set(x, y);
        this.isInteracting = true;
        this._updateMouse3D();
    }

    _updateMouse3D() {
        this.raycaster.setFromCamera(this.mouse, this.view.camera);
        this.raycaster.ray.intersectPlane(this.interactionPlane, this.mouse3D);
    }

    handleInteractionEnd() {
        this.isInteracting = false;
    }
}
