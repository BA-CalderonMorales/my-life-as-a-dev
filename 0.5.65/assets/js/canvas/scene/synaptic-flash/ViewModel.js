/**
 * Synaptic Flash ViewModel - Core Behavioral Logic
 * 
 * Orchestrates neural network tree generation, signal propagation physics,
 * and emissive pulse decay.
 */
import * as THREE from 'three';
import { SYNAPTIC_FLASH_CONFIG, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = SYNAPTIC_FLASH_CONFIG;
        this.isMobile = isMobile;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.count = perf.nodeCount;

        this.nodes = [];
        this.edges = [];
        this.pulses = [];
        
        this.startTime = performance.now();
        this.nextPulseTime = 0;
    }

    init() {
        const colors = getColors();
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        this.view.init(this.config, colors);
        this.view.addNodes(this.count, perf.sphereSize, colors);

        // Behavior: Generate neural tree structure
        const positions = [new THREE.Vector3(0, 0, 0)];
        this.view.nodes[0].position.copy(positions[0]);

        for (let i = 1; i < this.count; i++) {
            const parentIdx = Math.floor(Math.random() * i);
            const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
            const pos = positions[parentIdx].clone().add(dir.multiplyScalar(2 + Math.random() * 2));
            positions.push(pos);
            this.view.nodes[i].position.copy(pos);
            this.edges.push({ from: parentIdx, to: i, baseOpacity: colors.lineOpacity });
        }

        // Behavior: Add network jitter/cross-links
        for (let i = 0; i < this.count; i++) {
            for (let j = i + 1; j < this.count; j++) {
                if (positions[i].distanceTo(positions[j]) < 4 && Math.random() < 0.2) {
                    this.edges.push({ from: i, to: j, baseOpacity: colors.lineOpacity * 0.5 });
                }
            }
        }

        this.view.addConnections(this.edges.length, colors.lineColor, colors.lineOpacity);

        positions.forEach((p, i) => {
            this.nodes.push({
                index: i,
                targetEmissive: colors.nodeEmissive,
                currentEmissive: colors.nodeEmissive
            });
        });
    }

    update() {
        const colors = getColors();
        const elapsed = (performance.now() - this.startTime) / 1000;
        const cfg = this.config.physics;

        // Behavior: Periodic pulse emission from root
        if (elapsed >= this.nextPulseTime) {
            this.nextPulseTime = elapsed + cfg.pulseIntervalRange[0] + Math.random() * (cfg.pulseIntervalRange[1] - cfg.pulseIntervalRange[0]);
            this.pulses.push({ nodeIdx: 0, age: 0, propagated: false });
        }

        this._processPulses(colors);
        this._updateVisuals(elapsed, colors);
        
        this.view.render();
    }

    _processPulses(colors) {
        const cfg = this.config.physics;
        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const pulse = this.pulses[i];
            pulse.age += 0.016;

            if (pulse.age >= cfg.pulseDecay) {
                this.pulses.splice(i, 1);
                continue;
            }

            const intensity = 1 - (pulse.age / cfg.pulseDecay);
            this.nodes[pulse.nodeIdx].targetEmissive = Math.max(this.nodes[pulse.nodeIdx].targetEmissive, colors.brightEmissive * intensity);

            // Behavior: Probability-based signal propagation
            if (pulse.age > 0.15 && !pulse.propagated && Math.random() < cfg.propagateChance) {
                pulse.propagated = true;
                const neighbors = this.edges.filter(e => e.from === pulse.nodeIdx || e.to === pulse.nodeIdx)
                                          .map(e => e.from === pulse.nodeIdx ? e.to : e.from);
                if (neighbors.length > 0) {
                    this.pulses.push({ nodeIdx: neighbors[Math.floor(Math.random() * neighbors.length)], age: 0, propagated: false });
                }
            }
        }
    }

    _updateVisuals(elapsed, colors) {
        const cfg = this.config.physics;
        this.nodes.forEach((node, i) => {
            node.targetEmissive = Math.max(colors.nodeEmissive, node.targetEmissive * cfg.decaySpeed);
            node.currentEmissive += (node.targetEmissive - node.currentEmissive) * cfg.lerpFactor;
            this.view.nodes[i].material.emissiveIntensity = node.currentEmissive;
            
            // Behavior: Subtle organic node swaying
            this.view.nodes[i].position.y += Math.sin(elapsed * 0.4 + i) * 0.001;
        });

        this.view.connections.forEach((line, i) => {
            const edge = this.edges[i];
            const from = this.nodes[edge.from];
            const to = this.nodes[edge.to];
            const activeIntensity = Math.max(from.currentEmissive, to.currentEmissive);
            line.material.opacity = edge.baseOpacity + activeIntensity * 0.4;
            
            // Behavior: Orchestrate connection endpoints
            const pos = line.geometry.attributes.position.array;
            const p1 = this.view.nodes[edge.from].position;
            const p2 = this.view.nodes[edge.to].position;
            pos[0] = p1.x; pos[1] = p1.y; pos[2] = p1.z;
            pos[3] = p2.x; pos[4] = p2.y; pos[5] = p2.z;
            line.geometry.attributes.position.needsUpdate = true;
        });

        // Behavior: Organic camera swaying logic
        this.view.camera.position.x = Math.sin(elapsed * 0.2) * 1.5;
        this.view.camera.position.y = Math.cos(elapsed * 0.15) * 1.0;
        this.view.camera.lookAt(0, 0, 0);
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
