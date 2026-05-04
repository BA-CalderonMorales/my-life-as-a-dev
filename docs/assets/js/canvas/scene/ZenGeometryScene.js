/**
 * Zen Geometry Scene - Orchestrator
 */
import { View } from './zen-geometry/View.js';
import { ViewModel } from './zen-geometry/ViewModel.js';

export class ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.view = null;
        this.viewModel = null;
        this.animationId = null;
        this.isDestroyed = false;

        this._handleResize = this._onResize.bind(this);
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
            this._setupThemeObserver();
            window.addEventListener('resize', this._boundResize);
            return true;
        } catch (err) {
            console.error('Failed to initialize ZenGeometryScene:', err);
            this.destroy();
            return false;
        }
    }

    _onResize() {
        if (this.viewModel) this.viewModel.onResize();
    }

    _setupThemeObserver() {
        // grayscale for now
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
