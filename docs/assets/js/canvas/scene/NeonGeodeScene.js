import { CrystalCaveScene } from './CrystalCaveScene.js';

export class NeonGeodeScene extends CrystalCaveScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.emissiveIntensity = 2.0; this.roughness = 0.1; this.metalness = 0.9; this.baseColor = 0xff00ff;
        console.log('NeonGeodeScene injected properties applied.');
        // Overrides for Neon Geode will go here
    }
    
    // Override init or start methods here specifically for this variation
}
