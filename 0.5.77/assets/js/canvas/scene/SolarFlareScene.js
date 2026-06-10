/**
 * Solar Flare Scene - Orchestrator
 */
import { View } from './solar-flare/View.js';
import { ViewModel } from './solar-flare/ViewModel.js';

export class SolarFlareScene {
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

        this.view = new View(this.container, isMobile);
        this.viewModel = new ViewModel(this.view, isMobile);
        
        try {
            this.viewModel.init();
            this._startRenderLoop();
            window.addEventListener('resize', this._boundResize);
            return true;
        } catch (err) {
            console.error('Failed to initialize SolarFlareScene:', err);
            this.destroy();
            return false;
        }
    }

    _onResize() {
        if (this.viewModel) this.viewModel.onResize();
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

        if (this.viewModel) this.viewModel.dispose();
    }
}
