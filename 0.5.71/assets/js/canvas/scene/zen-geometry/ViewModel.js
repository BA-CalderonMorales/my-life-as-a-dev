/**
 * Zen Geometry ViewModel - Core Behavioral Logic
 * 
 * Orchestrates node floating physics, orbital camera rotation,
 * and connection orchestration.
 */
import * as THREE from 'three';
import { ZEN_GEOMETRY_CONFIG, ZEN_NODE_DEFINITIONS, ZEN_CONNECTIONS, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = ZEN_GEOMETRY_CONFIG;
        this.isMobile = isMobile;

        this.startTime = performance.now();
        this.nodeStates = ZEN_NODE_DEFINITIONS.map(d => ({
            basePos: new THREE.Vector3(...d.position),
            currentPos: new THREE.Vector3(...d.position),
            speed: 0.4 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            size: d.size
        }));

        this.dummy = new THREE.Object3D();
    }

    init() {
        const colors = getColors();
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        this.view.init(colors, perf);
        this.view.addCentralForm(perf.icoSize, colors);
        this.view.addInstancedNodes(ZEN_NODE_DEFINITIONS.length, colors);
        this.view.addConnections(ZEN_CONNECTIONS.length, colors.lineColor);

        // Behavior: Initial node matrix placement
        const nodeScale = perf.nodeScale;
        this.nodeStates.forEach((state, i) => {
            const scale = state.size * nodeScale;
            this.dummy.scale.set(scale, scale, scale);
            this.dummy.position.copy(state.basePos);
            this.dummy.updateMatrix();
            this.view.nodes.setMatrixAt(i, this.dummy.matrix);
        });
        this.view.nodes.instanceMatrix.needsUpdate = true;
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        // Behavior: Float nodes organically
        const nodeScale = perf.nodeScale;
        this.nodeStates.forEach((state, i) => {
            const driftY = Math.sin(elapsed * state.speed + state.phase) * this.config.physics.driftSpeed;
            state.currentPos.copy(state.basePos);
            state.currentPos.y += driftY;

            const scale = state.size * nodeScale;
            this.dummy.scale.set(scale, scale, scale);
            this.dummy.position.copy(state.currentPos);
            this.dummy.updateMatrix();
            this.view.nodes.setMatrixAt(i, this.dummy.matrix);
        });
        this.view.nodes.instanceMatrix.needsUpdate = true;

        // Behavior: Orchestrate connection endpoints
        this.view.connections.forEach((line, i) => {
            const [fromIdx, toIdx] = ZEN_CONNECTIONS[i];
            const pos = line.geometry.attributes.position.array;
            const p1 = this.nodeStates[fromIdx].currentPos;
            const p2 = this.nodeStates[toIdx].currentPos;
            pos[0] = p1.x; pos[1] = p1.y; pos[2] = p1.z;
            pos[3] = p2.x; pos[4] = p2.y; pos[5] = p2.z;
            line.geometry.attributes.position.needsUpdate = true;
        });

        // Behavior: Orbital camera rotation logic
        const orbitRadius = perf.camDistance;
        this.view.camera.position.x = Math.sin(elapsed * this.config.physics.orbitSpeed) * orbitRadius;
        this.view.camera.position.z = Math.cos(elapsed * this.config.physics.orbitSpeed) * orbitRadius;
        this.view.camera.lookAt(0, 0, 0);

        this.view.render();
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
