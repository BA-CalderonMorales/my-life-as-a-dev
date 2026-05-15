/**
 * Echo Chains ViewModel - Core Behavioral Logic
 * 
 * Orchestrates node movements, echoing ring propagation,
 * and orbital physics.
 */
import * as THREE from 'three';
import { ECHO_CHAINS_CONFIG, NODE_DEFINITIONS, CONNECTIONS } from './Model.js';
import { getCurrentTheme, themes } from '../themes/ThemeConfig.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = ECHO_CHAINS_CONFIG;
        this.isMobile = isMobile;

        // Interaction State (Behavioral)
        this.mouse3D = new THREE.Vector3(0, 0, 0);
        this.isInteracting = false;
        this.startTime = performance.now();
        
        // Node state
        this.nodeBasePositions = NODE_DEFINITIONS.map(d => new THREE.Vector3(...d.position));
        this.nodeCurrentPositions = NODE_DEFINITIONS.map(d => new THREE.Vector3(...d.position));
        this.nodeSpeeds = NODE_DEFINITIONS.map(() => 0.5 + Math.random() * 1.5);
        this.nodePhases = NODE_DEFINITIONS.map(() => Math.random() * Math.PI * 2);

        // Ring state
        this.ringStates = Array.from({ length: this.config.physics.ringPoolSize }, () => ({
            active: false,
            life: 0,
            origin: new THREE.Vector3()
        }));

        this.dummy = new THREE.Object3D();
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    init(colors) {
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        const central = this.isMobile ? this.config.central.mobile : this.config.central.desktop;

        this.view.init(colors, perf);
        this.view.addCentralForm(central.size, colors);
        this.view.addInstancedNodes(NODE_DEFINITIONS.length, colors);
        this.view.addConnections(CONNECTIONS, colors.lineColor);
        this.view.addRingPool(this.config.physics.ringPoolSize, colors.glowColor);
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
        const dt = 0.016;

        // Behavior: Orbit central form
        const orbitRadius = this.isMobile ? 16 : 22;
        this.view.camera.position.x = Math.sin(elapsed * this.config.physics.orbitSpeed) * orbitRadius;
        this.view.camera.position.z = Math.cos(elapsed * this.config.physics.orbitSpeed) * orbitRadius;
        this.view.camera.lookAt(0, 0, 0);

        // Behavior: Update node positions (floaty)
        this.nodeCurrentPositions.forEach((pos, i) => {
            const base = this.nodeBasePositions[i];
            const p = this.nodePhases[i];
            const s = this.nodeSpeeds[i];
            pos.x = base.x + Math.sin(elapsed * s + p) * 0.5;
            pos.y = base.y + Math.cos(elapsed * s * 0.8 + p) * 0.5;
            pos.z = base.z + Math.sin(elapsed * s * 1.2 + p) * 0.3;

            this.dummy.position.copy(pos);
            this.dummy.scale.setScalar(NODE_DEFINITIONS[i].size);
            this.dummy.updateMatrix();
            this.view.nodes.setMatrixAt(i, this.dummy.matrix);
        });
        this.view.nodes.instanceMatrix.needsUpdate = true;

        // Behavior: Update connections
        this.view.connections.forEach((line, i) => {
            const [fromIdx, toIdx] = CONNECTIONS[i];
            const pos = line.geometry.attributes.position.array;
            const p1 = this.nodeCurrentPositions[fromIdx];
            const p2 = this.nodeCurrentPositions[toIdx];
            pos[0] = p1.x; pos[1] = p1.y; pos[2] = p1.z;
            pos[3] = p2.x; pos[4] = p2.y; pos[5] = p2.z;
            line.geometry.attributes.position.needsUpdate = true;
        });

        // Behavior: Process Echo Rings
        this._updateRings(elapsed, dt);

        this.view.render();
    }

    _updateRings(elapsed, dt) {
        const maxLife = this.config.physics.ringMaxLife;
        this.ringStates.forEach((state, i) => {
            const ring = this.view.rings[i];
            if (!state.active) {
                // Occasionally spawn ring from center or nodes
                if (Math.random() < 0.005) {
                    state.active = true;
                    state.life = 0;
                    state.origin.set(0, 0, 0); // Spawning from center
                    ring.visible = true;
                }
                return;
            }

            state.life += dt;
            if (state.life > maxLife) {
                state.active = false;
                ring.visible = false;
                return;
            }

            const t = state.life / maxLife;
            ring.position.copy(state.origin);
            ring.scale.setScalar(t * 15);
            ring.material.opacity = (1 - t) * 0.4;
        });
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
