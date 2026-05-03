/**
 * Obsidian Shards Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 * Uses InstancedMesh for performance.
 */
import { OBSIDIAN_CONFIG } from './obsidian-shards/Model.js';
import { View } from './obsidian-shards/View.js';
import { ViewModel } from './obsidian-shards/ViewModel.js';

export class ObsidianShardsScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.view = null;
        this.viewModel = null;
        this.animationId = null;
        this.isDestroyed = false;

        this._boundResize = this._onResize.bind(this);
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }

        const isMobile = window.innerWidth < 768;
        const config = isMobile ? OBSIDIAN_CONFIG.mobile : OBSIDIAN_CONFIG.desktop;

        this.view = new View(this.container, isMobile);
        const shardConfigs = this.view.createShards(
            OBSIDIAN_CONFIG.lightColors,
            OBSIDIAN_CONFIG.lightPositions,
            config.count
        );

        this.viewModel = new ViewModel(this.view, shardConfigs);

        this._startRenderLoop();
        window.addEventListener('resize', this._boundResize);
        return true;
    }

    _onResize() {
        this.view.onResize();
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);
            this.viewModel.update();
        };
        animate();
    }

    destroy() {
        this.isDestroyed = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this._boundResize);

        if (this.view) this.view.dispose();
    }
}
