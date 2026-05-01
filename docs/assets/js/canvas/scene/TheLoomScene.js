import { ZenGeometryScene } from './ZenGeometryScene.js';

export class TheLoomScene extends ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.geometryType = 'thread'; this.lineDensity = 1000;
        console.log('TheLoomScene injected properties applied.');
        // Overrides for The Loom will go here
    }
    
    // Override init or start methods here specifically for this variation
}
