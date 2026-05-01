import { CrystalCaveScene } from './CrystalCaveScene.js';

export class ObsidianShardsScene extends CrystalCaveScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
        this.crystalType = 'shard'; this.baseColor = 0x010101; this.metalness = 1.0; this.roughness = 0.0;
        console.log('ObsidianShardsScene injected properties applied.');
        // Overrides for Obsidian Shards will go here
    }
    
    // Override init or start methods here specifically for this variation
}
