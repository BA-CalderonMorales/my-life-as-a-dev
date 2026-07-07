/**
 * Solar Flare ViewModel - Core Behavioral Logic
 * 
 * Orchestrates plasma particle physics, sun pulse animations,
 * and velocity-based color transitions.
 */
import { SOLAR_FLARE_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = SOLAR_FLARE_CONFIG;
        this.isMobile = isMobile;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.count = perf.particleCount;
        this.particleSize = perf.size;

        this.positions = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);
        this.ages = new Float32Array(this.count);
        this.lifetimes = new Float32Array(this.count);
        this.velocities = new Float32Array(this.count * 3);
        
        this.startTime = performance.now();
    }

    init() {
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        this.view.init(this.config.colors, perf);
        this.view.addSun(this.config.colors);
        this.view.addParticles(this.positions, this.colors, this.particleSize);

        // Behavior: Initial randomized particle states
        for (let i = 0; i < this.count; i++) {
            this._resetParticle(i, true);
        }
    }

    _resetParticle(i, randomStart = false) {
        const idx = i * 3;
        const cfg = this.config.physics;
        
        this.positions[idx] = 0; 
        this.positions[idx+1] = 0; 
        this.positions[idx+2] = 0;
        
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        const speed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
        
        this.velocities[idx] = Math.cos(elevation) * Math.cos(angle) * speed;
        this.velocities[idx+1] = Math.cos(elevation) * Math.sin(angle) * speed;
        this.velocities[idx+2] = Math.sin(elevation) * speed;
        
        this.ages[i] = randomStart ? Math.random() * cfg.minLifetime : 0;
        this.lifetimes[i] = cfg.minLifetime + Math.random() * (cfg.maxLifetime - cfg.minLifetime);
        
        const initCol = this.config.colors.particleInitial;
        this.colors[idx] = initCol[0]; 
        this.colors[idx+1] = initCol[1]; 
        this.colors[idx+2] = initCol[2];
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const dt = 0.016;
        const cfg = this.config.physics;

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            this.ages[i] += dt;
            
            // Behavior: Re-spawn particle after lifetime
            if (this.ages[i] > this.lifetimes[i]) {
                this._resetParticle(i, false);
                continue;
            }
            
            // Behavior: Plasma acceleration
            this.velocities[idx] *= cfg.acceleration;
            this.velocities[idx+1] *= cfg.acceleration;
            this.velocities[idx+2] *= cfg.acceleration;
            
            this.positions[idx] += this.velocities[idx] * dt;
            this.positions[idx+1] += this.velocities[idx+1] * dt;
            this.positions[idx+2] += this.velocities[idx+2] * dt;
            
            // Behavior: Color transformation based on normalized age
            this._updateColor(this.ages[i], this.lifetimes[i], i);
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;
        this.view.particles.geometry.attributes.color.needsUpdate = true;
        
        // Behavior: Sun pulse logic
        this.view.sunGlow.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.05);
        this.view.sun.rotation.y += 0.005;

        this.view.render();
    }

    _updateColor(age, lifetime, i) {
        const idx = i * 3;
        const t = age / lifetime;
        if (t < 0.2) {
            this.colors[idx] = 1.0; this.colors[idx+1] = 0.95; this.colors[idx+2] = 0.8;
        } else if (t < 0.5) {
            this.colors[idx] = 1.0; this.colors[idx+1] = 0.7; this.colors[idx+2] = 0.2;
        } else if (t < 0.8) {
            this.colors[idx] = 1.0; this.colors[idx+1] = 0.35; this.colors[idx+2] = 0.05;
        } else {
            this.colors[idx] = 0.6; this.colors[idx+1] = 0.1; this.colors[idx+2] = 0.02;
        }
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
