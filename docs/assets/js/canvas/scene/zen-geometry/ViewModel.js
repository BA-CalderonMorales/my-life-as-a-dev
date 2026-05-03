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

        this.clock = new THREE.Clock();
    }

    update() {
        const elapsed = this.clock.getElapsedTime();
        this._updateNodes(elapsed);
        this._updateConnections();
        this._updateCamera(elapsed);
        this.view.render();
    }

    _updateNodes(elapsed) {
        const matrix = new THREE.Matrix4();
        const nodeScaleFactor = this.view.isMobile ? 0.85 : 1;

        this.nodeStates.forEach((state, i) => {
            // Orbital movement
            state.currentPos.x = state.basePos.x + Math.sin(elapsed * state.orbitSpeed + state.phase) * state.orbitRadius;
            state.currentPos.y = state.basePos.y + Math.cos(elapsed * state.floatSpeed + state.phase) * state.orbitRadius * 0.5;
            state.currentPos.z = state.basePos.z + Math.sin(elapsed * state.orbitSpeed * 0.7 + state.phase) * state.orbitRadius * 0.3;

            // Breathing
            const breathe = 1 + Math.sin(elapsed * state.breatheSpeed + state.breathePhase) * 0.05;
            const finalScale = state.scale * nodeScaleFactor * breathe;

            // Interaction
            if (this.isInteracting) {
                const dist = state.currentPos.distanceTo(this.mouse3D);
                state.targetEmissive = dist < 3.5 ? 0.07 + (1 - dist / 3.5) * 0.05 : 0.03;
            } else {
                state.targetEmissive = 0.03;
            }
            state.emissive += (state.targetEmissive - state.emissive) * 0.08;

            // Update matrix
            matrix.makeScale(finalScale, finalScale, finalScale);
            matrix.setPosition(state.currentPos);
            this.view.nodes.setMatrixAt(i, matrix);
        });

        this.view.nodes.instanceMatrix.needsUpdate = true;
        // Note: MeshPhysicalMaterial emissiveIntensity is not per-instance.
        // For per-instance emissive, we'd need a custom shader or instance colors.
        // For KISS, we'll keep it simple for now or use instance color for glow.
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
        });
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
