import { CrystalCaveScene } from './CrystalCaveScene.js';

export class GlacialCavernsScene extends CrystalCaveScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.crystalType = 'ice'; this.refractionRatio = 0.98; this.baseColor = 0xaaddff;
        console.log('GlacialCavernsScene injected properties applied.');
        // Overrides for Glacial Caverns will go here
    }
    
    // Override init or start methods here specifically for this variation
}
