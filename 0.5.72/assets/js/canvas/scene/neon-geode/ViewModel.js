/**
 * Neon Geode ViewModel - Core Behavioral Logic
 * 
 * Orchestrates crystal shimmer pulsing, sparkle ascension physics,
 * and orbital camera movements.
 */
import * as THREE from 'three';
import { NEON_GEODE_CONFIG, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = NEON_GEODE_CONFIG;
        this.isMobile = isMobile;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.crystalCount = perf.crystalCount;
        this.sparkleCount = perf.sparkleCount;

        this.startTime = performance.now();
        this.sparkleVelocities = new Float32Array(this.sparkleCount * 3);
        this.sparkleColors = new Float32Array(this.sparkleCount * 3);
        this.sparklePositions = new Float32Array(this.sparkleCount * 3);
    }

    init() {
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        const colors = getColors();

        this.view.init(colors, perf);
        this.view.addPointLights(this.config.lightConfigs);
        this.view.addGeode(this.isMobile ? 0.82 : 1.08, colors);

        // Behavior: Generate randomized crystal cluster
        for (let i = 0; i < this.crystalCount; i++) {
            const color = this.config.palette[i % this.config.palette.length];
            const emissiveInt = 1.05 + (i % 5) * 0.12;
            const crystal = this.view.addCrystal(color, emissiveInt);

            const spread = i / Math.max(this.crystalCount - 1, 1);
            const angle = spread * Math.PI * 8 + Math.sin(i * 12.9898) * 0.28;
            const dist = 0.8 + Math.pow(spread, 0.7) * (this.isMobile ? 4.2 : 5.4);
            const height = (i < 5 ? 2.3 : 1.15) + (Math.sin(i * 78.233) * 0.5 + 0.5) * 2.35;
            const radius = 0.18 + (Math.sin(i * 31.719) * 0.5 + 0.5) * 0.32;

            crystal.scale.set(radius, height, radius);
            crystal.position.set(Math.cos(angle) * dist, -2 + height / 2, Math.sin(angle) * dist);
            crystal.rotation.set(Math.sin(angle) * 0.22, angle, Math.cos(angle) * 0.24);

            crystal.userData.baseEmissive = emissiveInt;
            crystal.userData.pulseSpeed = this.config.physics.pulseSpeedRange[0] + (i % 7) * 0.18;
            crystal.userData.pulseOffset = i * 0.71;
        }

        // Behavior: Generate randomized sparkle states
        for (let i = 0; i < this.sparkleCount; i++) {
            const idx = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.2 + Math.random() * 7.2;
            const color = new THREE.Color(this.config.palette[i % this.config.palette.length]);

            this.sparklePositions[idx] = Math.cos(angle) * radius;
            this.sparklePositions[idx + 1] = -1.45 + Math.random() * 5.8;
            this.sparklePositions[idx + 2] = Math.sin(angle) * radius;
            
            this.sparkleColors[idx] = color.r;
            this.sparkleColors[idx + 1] = color.g;
            this.sparkleColors[idx + 2] = color.b;
            
            this.sparkleVelocities[idx] = (Math.random() - 0.5) * 0.0025;
            this.sparkleVelocities[idx + 1] = this.config.physics.sparkleSpeed[0] + Math.random() * (this.config.physics.sparkleSpeed[1] - this.config.physics.sparkleSpeed[0]);
            this.sparkleVelocities[idx + 2] = (Math.random() - 0.5) * 0.0025;
        }

        this.view.addSparkles(this.sparklePositions, this.sparkleColors, this.isMobile ? 0.06 : 0.045);
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const dt = 0.016;

        // Behavior: Animate crystal shimmers
        this.view.crystals.forEach((crystal) => {
            const ud = crystal.userData;
            crystal.material.emissiveIntensity = ud.baseEmissive + Math.sin(elapsed * ud.pulseSpeed + ud.pulseOffset) * 0.3;
            crystal.rotation.y += dt * 0.15;
        });

        // Behavior: Animate core pulse
        this.view.core.scale.setScalar(1.0 + Math.sin(elapsed * 1.2) * 0.045);
        this.view.core.rotation.y -= dt * 0.22;

        // Behavior: Animate sparkle ascension
        const pos = this.view.sparkles.geometry.attributes.position.array;
        for (let i = 0; i < this.sparkleCount; i++) {
            const idx = i * 3;
            pos[idx] += this.sparkleVelocities[idx];
            pos[idx + 1] += this.sparkleVelocities[idx + 1];
            pos[idx + 2] += this.sparkleVelocities[idx + 2];

            if (pos[idx + 1] > 4.35) {
                pos[idx + 1] = -1.45;
            }
        }
        this.view.sparkles.geometry.attributes.position.needsUpdate = true;

        // Behavior: Camera orbital logic
        this.view.camera.position.x = Math.sin(elapsed * this.config.physics.orbitSpeed) * (this.isMobile ? 11 : 10.5);
        this.view.camera.position.z = Math.cos(elapsed * this.config.physics.orbitSpeed) * (this.isMobile ? 11 : 10.5);
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
