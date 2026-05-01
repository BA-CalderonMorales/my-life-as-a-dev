import { CrystalCaveScene } from './CrystalCaveScene.js';

export class RadioactiveSlagScene extends CrystalCaveScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.emissiveColor = 0x33ff33; this.emissiveIntensity = 5.0; this.pulseRate = 2.0;
        console.log('RadioactiveSlagScene injected properties applied.');
        // Overrides for Radioactive Slag will go here
    }
    
    // Override init or start methods here specifically for this variation
}
