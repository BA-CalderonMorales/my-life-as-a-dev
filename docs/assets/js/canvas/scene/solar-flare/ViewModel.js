/**
 * Solar Flare ViewModel - Core Logic and Physics
 */
import { SOLAR_FLARE_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, particleCount) {
        this.view = view;
        this.count = particleCount;
        this.ages = new Float32Array(this.count);
        this.lifetimes = new Float32Array(this.count);
        this.velocities = new Float32Array(this.count * 3);
        this.startTime = performance.now();
    }

    init(randomStart = false) {
        const pos = this.view.particles.geometry.attributes.position.array;
        const col = this.view.particles.geometry.attributes.color.array;
        for (let i = 0; i < this.count; i++) {
            this._resetParticle(pos, col, i, randomStart);
        }
    }

    _resetParticle(pos, col, i, randomStart) {
        const idx = i * 3;
        pos[idx] = 0; pos[idx+1] = 0; pos[idx+2] = 0;
        
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        const speed = SOLAR_FLARE_CONFIG.physics.minSpeed + 
                      Math.random() * (SOLAR_FLARE_CONFIG.physics.maxSpeed - SOLAR_FLARE_CONFIG.physics.minSpeed);
        
        this.velocities[idx] = Math.cos(elevation) * Math.cos(angle) * speed;
        this.velocities[idx+1] = Math.cos(elevation) * Math.sin(angle) * speed;
        this.velocities[idx+2] = Math.sin(elevation) * speed;
        
        this.ages[i] = randomStart ? Math.random() * SOLAR_FLARE_CONFIG.physics.minLifetime : 0;
        this.lifetimes[i] = SOLAR_FLARE_CONFIG.physics.minLifetime + 
                            Math.random() * (SOLAR_FLARE_CONFIG.physics.maxLifetime - SOLAR_FLARE_CONFIG.physics.minLifetime);
        
        const initCol = SOLAR_FLARE_CONFIG.colors.particleInitial;
        col[idx] = initCol[0]; col[idx+1] = initCol[1]; col[idx+2] = initCol[2];
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const dt = 0.016;
        const pos = this.view.particles.geometry.attributes.position.array;
        const col = this.view.particles.geometry.attributes.color.array;
        const cfg = SOLAR_FLARE_CONFIG.physics;

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            this.ages[i] += dt;
            
            if (this.ages[i] > this.lifetimes[i]) {
                this._resetParticle(pos, col, i, false);
                continue;
            }
            
            this.velocities[idx] *= cfg.acceleration;
            this.velocities[idx+1] *= cfg.acceleration;
            this.velocities[idx+2] *= cfg.acceleration;
            
            pos[idx] += this.velocities[idx] * dt;
            pos[idx+1] += this.velocities[idx+1] * dt;
            pos[idx+2] += this.velocities[idx+2] * dt;
            
            this._updateColor(col, this.ages[i], this.lifetimes[i], i);
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;
        this.view.particles.geometry.attributes.color.needsUpdate = true;
        
        this.view.sunGlow.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.05);
        this.view.sun.rotation.y += 0.005;

        this.view.render();
    }

    _updateColor(colors, age, lifetime, i) {
        const idx = i * 3;
        const t = age / lifetime;
        if (t < 0.2) {
            colors[idx] = 1.0; colors[idx+1] = 0.95; colors[idx+2] = 0.8;
        } else if (t < 0.5) {
            colors[idx] = 1.0; colors[idx+1] = 0.7; colors[idx+2] = 0.2;
        } else if (t < 0.8) {
            colors[idx] = 1.0; colors[idx+1] = 0.35; colors[idx+2] = 0.05;
        } else {
            colors[idx] = 0.6; colors[idx+1] = 0.1; colors[idx+2] = 0.02;
        }
    }
}
