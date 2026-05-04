/**
 * Quantum Lattice ViewModel - Core Logic and Physics
 */
import * as THREE from 'three';
import { QUANTUM_LATTICE_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, gridSize, spacing, colors) {
        this.view = view;
        this.gridSize = gridSize;
        this.spacing = spacing;
        this.colors = colors;
        
        this.count = gridSize * gridSize * gridSize;
        this.basePositions = new Float32Array(this.count * 3);
        this.currentPositions = new Float32Array(this.count * 3);
        this.phases = new Float32Array(this.count);
        this.speeds = new Float32Array(this.count);
        this.amplitudes = new Float32Array(this.count);
        
        this.edges = [];
        this.matrixObject = new THREE.Object3D();
        this.startTime = performance.now();
    }

    init() {
        const offset = ((this.gridSize - 1) * this.spacing) / 2;
        let index = 0;

        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                for (let z = 0; z < this.gridSize; z++) {
                    const idx = index * 3;
                    const bx = x * this.spacing - offset;
                    const by = y * this.spacing - offset;
                    const bz = z * this.spacing - offset;

                    this.basePositions[idx] = bx;
                    this.basePositions[idx + 1] = by;
                    this.basePositions[idx + 2] = bz;
                    
                    this.phases[index] = Math.random() * Math.PI * 2;
                    this.speeds[index] = QUANTUM_LATTICE_CONFIG.physics.speedRange[0] + 
                                       Math.random() * (QUANTUM_LATTICE_CONFIG.physics.speedRange[1] - QUANTUM_LATTICE_CONFIG.physics.speedRange[0]);
                    this.amplitudes[index] = QUANTUM_LATTICE_CONFIG.physics.ampRange[0] + 
                                           Math.random() * (QUANTUM_LATTICE_CONFIG.physics.ampRange[1] - QUANTUM_LATTICE_CONFIG.physics.ampRange[0]);
                    
                    // Create edges
                    if (x + 1 < this.gridSize) this.edges.push(index, this._indexFor(x + 1, y, z));
                    if (y + 1 < this.gridSize) this.edges.push(index, this._indexFor(x, y + 1, z));
                    if (z + 1 < this.gridSize) this.edges.push(index, this._indexFor(x, y, z + 1));
                    
                    index++;
                }
            }
        }
    }

    _indexFor(x, y, z) {
        return x * this.gridSize * this.gridSize + y * this.gridSize + z;
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const cfg = QUANTUM_LATTICE_CONFIG.physics;

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
        
        // Creative touch: Emissive pulse
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
}
