import { ParticleFlowScene } from './ParticleFlowScene.js';

export class MagneticDustScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.particleDensity = 50000; this.flowSpeed = 0.2; this.viscosity = 0.9;
        console.log('MagneticDustScene injected properties applied.');
        // Overrides for Magnetic Dust will go here
    }
    
    // Override init or start methods here specifically for this variation
}
