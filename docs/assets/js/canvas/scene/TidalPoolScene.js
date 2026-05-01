import { ParticleFlowScene } from './ParticleFlowScene.js';

export class TidalPoolScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.fluidDynamics = true; this.surfaceDistortion = 1.2;
        console.log('TidalPoolScene injected properties applied.');
        // Overrides for Tidal Pool will go here
    }
    
    // Override init or start methods here specifically for this variation
}
