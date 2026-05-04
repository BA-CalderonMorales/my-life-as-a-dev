/**
 * Holographic Sand ViewModel - Core Behavioral Logic
 */
import * as THREE from 'three';
import { HOLOGRAPHIC_SAND_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = HOLOGRAPHIC_SAND_CONFIG;
        this.isMobile = isMobile;

        this.state = this.config.states.DRIFTING;
        this.timer = 0;
        this.progress = 0;
        this.targetShape = 'tetrahedron';
        
        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.count = perf.particleCount;
        this.particleSize = perf.size;

        this.positions = new Float32Array(this.count * 3);
        this.randomPositions = new Float32Array(this.count * 3);
        this.targetPositions = new Float32Array(this.count * 3);
        this.velocities = new Float32Array(this.count * 3);
        
        this.startTime = performance.now();
    }

    init() {
        // Behavior: Initial random positioning
        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 14;
            const z = (Math.random() - 0.5) * 10;
            this.positions[idx] = x;
            this.positions[idx+1] = y;
            this.positions[idx+2] = z;
            this.randomPositions[idx] = x;
            this.randomPositions[idx+1] = y;
            this.randomPositions[idx+2] = z;
            
            this.velocities[idx] = (Math.random() - 0.5) * 0.02;
            this.velocities[idx+1] = (Math.random() - 0.5) * 0.02;
            this.velocities[idx+2] = (Math.random() - 0.5) * 0.02;
        }

        this.view.init(this.config, this.isMobile ? this.config.performance.mobile : this.config.performance.desktop);
        this.view.addParticles(this.positions, this.config.colors, this.particleSize);
        this.view.addGrid(this.config.colors);
    }

    triggerFormation() {
        if (this.state !== this.config.states.DRIFTING && 
            this.state !== this.config.states.RETURNING) return;
            
        const shapes = this.config.shapes;
        this.targetShape = shapes[Math.floor(Math.random() * shapes.length)];
        this._generateShapePositions(this.targetShape);
        
        this.state = this.config.states.FORMING;
        this.progress = 0;
        this.timer = 0;
    }

    _generateShapePositions(shape) {
        const pos = this.targetPositions;
        if (shape === 'tetrahedron') {
            const v = [
                new THREE.Vector3(0, 3, 0),
                new THREE.Vector3(-3, -2, 2),
                new THREE.Vector3(3, -2, 2),
                new THREE.Vector3(0, -2, -4),
            ];
            for (let i = 0; i < this.count; i++) {
                const idx = i * 3;
                const v0 = v[Math.floor(Math.random() * 4)];
                const v1 = v[Math.floor(Math.random() * 4)];
                const v2 = v[Math.floor(Math.random() * 4)];
                const p = new THREE.Vector3().lerpVectors(v0, v1, Math.random()).lerp(v2, Math.random() * 0.5);
                pos[idx] = p.x; pos[idx+1] = p.y; pos[idx+2] = p.z;
            }
        } else if (shape === 'cube') {
            const s = 3;
            for (let i = 0; i < this.count; i++) {
                const idx = i * 3;
                const face = Math.floor(Math.random() * 6);
                const u = (Math.random() - 0.5) * 2 * s;
                const v = (Math.random() - 0.5) * 2 * s;
                if (face === 0) { pos[idx] = s; pos[idx+1] = u; pos[idx+2] = v; }
                else if (face === 1) { pos[idx] = -s; pos[idx+1] = u; pos[idx+2] = v; }
                else if (face === 2) { pos[idx] = u; pos[idx+1] = s; pos[idx+2] = v; }
                else if (face === 3) { pos[idx] = u; pos[idx+1] = -s; pos[idx+2] = v; }
                else if (face === 4) { pos[idx] = u; pos[idx+1] = v; pos[idx+2] = s; }
                else { pos[idx] = u; pos[idx+1] = v; pos[idx+2] = -s; }
            }
        } else if (shape === 'sphere') {
            const r = 3.5;
            for (let i = 0; i < this.count; i++) {
                const idx = i * 3;
                const theta = 2 * Math.PI * Math.random();
                const phi = Math.acos(2 * Math.random() - 1);
                pos[idx] = r * Math.sin(phi) * Math.cos(theta);
                pos[idx+1] = r * Math.sin(phi) * Math.sin(theta);
                pos[idx+2] = r * Math.cos(phi);
            }
        } else if (shape === 'torus') {
            const R = 4;
            const r = 1.5;
            for (let i = 0; i < this.count; i++) {
                const idx = i * 3;
                const u = Math.random() * Math.PI * 2;
                const v = Math.random() * Math.PI * 2;
                pos[idx] = (R + r * Math.cos(v)) * Math.cos(u);
                pos[idx+1] = (R + r * Math.cos(v)) * Math.sin(u);
                pos[idx+2] = r * Math.sin(v);
            }
        }
    }

    update() {
        const dt = 0.016;
        const states = this.config.states;

        if (this.state === states.FORMING) {
            this.progress += dt * this.config.timings.formSpeed;
            if (this.progress >= 1) { this.progress = 1; this.state = states.HOLDING; this.timer = 0; }
        } else if (this.state === states.HOLDING) {
            this.timer += dt;
            if (this.timer >= this.config.timings.hold) { this.state = states.RETURNING; }
        } else if (this.state === states.RETURNING) {
            this.progress -= dt * 0.5;
            if (this.progress <= 0) { this.progress = 0; this.state = states.DRIFTING; }
        }

        const t = this.progress;
        const ease = t * t * (3 - 2 * t);

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            if (this.state === states.DRIFTING) {
                this.positions[idx] += this.velocities[idx];
                this.positions[idx+1] += this.velocities[idx+1];
                this.positions[idx+2] += this.velocities[idx+2];
                
                if (Math.abs(this.positions[idx]) > 15) this.velocities[idx] *= -1;
                if (Math.abs(this.positions[idx+1]) > 10) this.velocities[idx+1] *= -1;
                if (Math.abs(this.positions[idx+2]) > 8) this.velocities[idx+2] *= -1;
            } else {
                const rx = this.randomPositions[idx];
                const ry = this.randomPositions[idx+1];
                const rz = this.randomPositions[idx+2];
                const tx = this.targetPositions[idx];
                const ty = this.targetPositions[idx+1];
                const tz = this.targetPositions[idx+2];
                
                this.positions[idx] = rx + (tx - rx) * ease;
                this.positions[idx+1] = ry + (ty - ry) * ease;
                this.positions[idx+2] = rz + (tz - rz) * ease;
            }
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;
        this.view.render();
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
