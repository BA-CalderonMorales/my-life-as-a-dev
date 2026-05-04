/**
 * Holographic Sand Scene - Orchestrator
 */
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
        this.viewModel = new ViewModel(this.view, isMobile);
        
        try {
            this.viewModel.init();
            this._setupListeners();
            this._startRenderLoop();
            return true;
        } catch (err) {
            console.error('Failed to initialize HolographicSandScene:', err);
            this.destroy();
            return false;
        }
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
        if (this.container) {
            this.container.removeEventListener('click', this._boundInteraction);
            this.container.removeEventListener('touchstart', this._boundInteraction);
        }

        if (this.viewModel) this.viewModel.dispose();
    }
}
