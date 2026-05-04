/**
 * Quantum Lattice ViewModel - Core Behavioral Logic
 * 
 * Orchestrates lattice generation, snap physics, and line orchestration.
 */
import * as THREE from 'three';
import { QUANTUM_LATTICE_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile, isTablet) {
        this.view = view;
        this.config = QUANTUM_LATTICE_CONFIG;
        this.isMobile = isMobile;
        this.isTablet = isTablet;

        this.perf = isMobile ? this.config.performance.mobile : (isTablet ? this.config.performance.tablet : this.config.performance.desktop);
        this.count = this.perf.gridSize ** 3;
        
        this.basePositions = new Float32Array(this.count * 3);
        this.currentPositions = new Float32Array(this.count * 3);
        this.phases = new Float32Array(this.count);
        this.speeds = new Float32Array(this.count);
        this.amplitudes = new Float32Array(this.count);
        
        this.edges = [];
        this.matrixObject = new THREE.Object3D();
        this.startTime = performance.now();
        this.colors = null;
    }

    init(colors) {
        this.colors = colors;
        this.view.init(colors, this.config);
        this.view.addInstancedNodes(this.count, this.perf.octaSize, colors);

        const spacing = this.perf.spacing;
        const size = this.perf.gridSize;
        const offset = ((size - 1) * spacing) / 2;
        let index = 0;

        // Behavior: Generate lattice structure and edge map
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const idx = index * 3;
                    this.basePositions[idx] = x * spacing - offset;
                    this.basePositions[idx + 1] = y * spacing - offset;
                    this.basePositions[idx + 2] = z * spacing - offset;
                    
                    this.phases[index] = Math.random() * Math.PI * 2;
                    this.speeds[index] = this.config.physics.speedRange[0] + 
                                       Math.random() * (this.config.physics.speedRange[1] - this.config.physics.speedRange[0]);
                    this.amplitudes[index] = this.config.physics.ampRange[0] + 
                                           Math.random() * (this.config.physics.ampRange[1] - this.config.physics.ampRange[0]);
                    
                    if (x + 1 < size) this.edges.push(index, this._indexFor(x + 1, y, z));
                    if (y + 1 < size) this.edges.push(index, this._indexFor(x, y + 1, z));
                    if (z + 1 < size) this.edges.push(index, this._indexFor(x, y, z + 1));
                    
                    index++;
                }
            }
        }

        this.view.addLines(this.edges.length / 2, colors.lineColor, colors.lineOpacity);
    }

    _indexFor(x, y, z) {
        const size = this.perf.gridSize;
        return x * size * size + y * size + z;
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const cfg = this.config.physics;

        // Behavior: "Snap" physics movement
        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            const t = elapsed * this.speeds[i] + this.phases[i];
            const snap = Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), cfg.snapPower);
            
            this.currentPositions[idx] = this.basePositions[idx] + snap * this.amplitudes[i];
            this.currentPositions[idx + 1] = this.basePositions[idx + 1] + Math.sin(t * 1.2) * this.amplitudes[i];
            this.currentPositions[idx + 2] = this.basePositions[idx + 2] + Math.cos(t * 0.8) * this.amplitudes[i];

            this.matrixObject.position.set(this.currentPositions[idx], this.currentPositions[idx + 1], this.currentPositions[idx + 2]);
            this.matrixObject.rotation.set(elapsed * 0.4 + this.phases[i], elapsed * 0.2, 0);
            this.matrixObject.updateMatrix();
            this.view.nodes.setMatrixAt(i, this.matrixObject.matrix);
        }

        this.view.nodes.instanceMatrix.needsUpdate = true;
        this._updateLines();
        
        // Behavior: Emissive pulse sync
        this.view.nodes.material.emissiveIntensity = this.colors.emissiveBase + Math.sin(elapsed * 2) * 0.05;

        this.view.render();
    }

    _updateLines() {
        const linePos = this.view.lines.geometry.attributes.position.array;
        let writeIdx = 0;
        for (let i = 0; i < this.edges.length; i += 2) {
            const from = this.edges[i] * 3;
            const to = this.edges[i + 1] * 3;
            linePos[writeIdx++] = this.currentPositions[from];
            linePos[writeIdx++] = this.currentPositions[from + 1];
            linePos[writeIdx++] = this.currentPositions[from + 2];
            linePos[writeIdx++] = this.currentPositions[to];
            linePos[writeIdx++] = this.currentPositions[to + 1];
            linePos[writeIdx++] = this.currentPositions[to + 2];
        }
        this.view.lines.geometry.attributes.position.needsUpdate = true;
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
