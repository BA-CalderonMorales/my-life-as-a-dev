import { ParticleFlowScene } from './ParticleFlowScene.js';

export class HolographicSandScene extends ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.particleScale = 0.1; this.hologramEffect = true;
        console.log('HolographicSandScene injected properties applied.');
        // Overrides for Holographic Sand will go here
    }
    
    // Override init or start methods here specifically for this variation
}
