import { ParticleFlowScene } from './ParticleFlowScene.js';

export class SolarFlareScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.particleDensity = 100000; this.heatEmission = true; this.baseColor = 0xffaa00;
        console.log('SolarFlareScene injected properties applied.');
        // Overrides for Solar Flare will go here
    }
    
    // Override init or start methods here specifically for this variation
}
