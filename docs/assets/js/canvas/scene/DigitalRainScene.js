import { ParticleFlowScene } from './ParticleFlowScene.js';

export class DigitalRainScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.flowDirection = 'down'; this.particleDensity = 20000; this.baseColor = 0x00ff00;
        console.log('DigitalRainScene injected properties applied.');
        // Overrides for Digital Rain will go here
    }
    
    // Override init or start methods here specifically for this variation
}
