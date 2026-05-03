/**
 * Radioactive Slag Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 */
import { RADIOACTIVE_CONFIG } from './radioactive-slag/Model.js';
import { View } from './radioactive-slag/View.js';
import { ViewModel } from './radioactive-slag/ViewModel.js';

export class RadioactiveSlagScene {
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
        const config = isMobile ? RADIOACTIVE_CONFIG.mobile : RADIOACTIVE_CONFIG.desktop;

        this.view = new View(this.container, isMobile);
        this.view.createLights(config.lightCount);
        this.view.createRocks(config.rockCount);

        this.viewModel = new ViewModel(this.view);

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
