export class ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
    }
    async init() {
        console.log("ParticleFlowScene initializing...");
        return true;
    }
    destroy() {}
}