/**
 * Digital Rain ViewModel - Core Behavioral Logic
 *
 * This file contains ALL logic, including data generation,
 * animation math, and state management.
 */
import { DIGITAL_RAIN_CONFIG, getColors } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = DIGITAL_RAIN_CONFIG;
        this.isMobile = isMobile;

        this.particlesPerColumn = isMobile ? this.config.performance.mobile.particlesPerColumn : this.config.performance.desktop.particlesPerColumn;
        this.count = this.config.columns * this.particlesPerColumn;

        this.positions = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);
        this.speeds = new Float32Array(this.count);
        this.flashes = new Float32Array(this.count);
    }

    init() {
        const columns = this.config.columns;
        const columnWidth = 30 / columns;
        const colors = getColors();

        for (let col = 0; col < columns; col++) {
            const x = (col - columns / 2) * columnWidth + (Math.random() - 0.5) * columnWidth * 0.5;
            for (let row = 0; row < this.particlesPerColumn; row++) {
                const idx = (col * this.particlesPerColumn + row) * 3;
                
                // Behavior: Initial randomized positions
                this.positions[idx] = x;
                this.positions[idx + 1] = 10 - (row / this.particlesPerColumn) * 20 + Math.random() * 2;
                this.positions[idx + 2] = (Math.random() - 0.5) * 5;

                // Behavior: Randomized speeds and initial colors
                const particleIdx = col * this.particlesPerColumn + row;
                this.speeds[particleIdx] = this.config.physics.speedMin + Math.random() * (this.config.physics.speedMax - this.config.physics.speedMin);
                this.flashes[particleIdx] = 0;

                const brightness = 0.3 + Math.random() * 0.5;
                this.colors[idx] = 0;
                this.colors[idx + 1] = brightness;
                this.colors[idx + 2] = 0;
            }
        }

        this.view.addParticles(this.positions, this.colors, 0.15);
        this.view.addFloor(colors.floor);
    }

    update() {
        const dt = 0.016;
        const phys = this.config.physics;
        const colors = getColors();

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;

            // Behavior: Rain falling movement
            this.positions[idx + 1] -= this.speeds[i] * dt;

            // Behavior: Flash decay
            if (this.flashes[i] > 0) {
                this.flashes[i] -= dt * 2;
            }

            // Behavior: Loop back to top and trigger flash
            if (this.positions[idx + 1] < phys.bottomY) {
                this.positions[idx + 1] = phys.resetY;
                this.flashes[i] = 1.0;
            }

            // Behavior: Color transformation based on height and flash state
            const flash = Math.max(0, this.flashes[i]);
            const baseGreen = colors.baseGreenMin + (Math.sin(this.positions[idx + 1] * 0.5) + 1) * 0.15;
            const green = Math.min(1.0, baseGreen + flash);
            
            this.colors[idx + 1] = green;
            this.colors[idx + 2] = flash * 0.2;
        }

        // Notify passive view that buffers changed
        this.view.particles.geometry.attributes.position.needsUpdate = true;
        this.view.particles.geometry.attributes.color.needsUpdate = true;

        this.view.render();
    }
}
