/**
 * Holographic Sand Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 */
import { HOLOGRAPHIC_SAND_CONFIG } from './holographic-sand/Model.js';
import { View } from './holographic-sand/View.js';
import { ViewModel } from './holographic-sand/ViewModel.js';

export class HolographicSandScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.view = null;
        this.viewModel = null;
        this.animationId = null;
        this.isDestroyed = false;

        this._boundResize = this._onResize.bind(this);
        this._boundInteraction = this._onInteraction.bind(this);
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
        this.view.init(HOLOGRAPHIC_SAND_CONFIG);

        this.viewModel = new ViewModel(this.view);
        this.viewModel.init();

        this._startRenderLoop();
        this._setupListeners();
        
        return true;
    }

    _setupListeners() {
        window.addEventListener('resize', this._boundResize);
        this.container.addEventListener('click', this._boundInteraction);
        this.container.addEventListener('touchstart', this._boundInteraction, { passive: true });
    }

    _onInteraction() {
        if (this.viewModel) this.viewModel.triggerFormation();
    }

    _onResize() {
        if (this.view) this.view.onResize();
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
        if (this.container) {
            this.container.removeEventListener('click', this._boundInteraction);
            this.container.removeEventListener('touchstart', this._boundInteraction);
        }

        if (this.view) this.view.dispose();
    }
}
