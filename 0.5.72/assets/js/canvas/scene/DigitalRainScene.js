/**
 * Digital Rain Scene - Orchestrator
 *
 * Coordinates the Lifecycle between the passive View and the logical ViewModel.
 */
import { getColors } from './digital-rain/Model.js';
import { View } from './digital-rain/View.js';
import { ViewModel } from './digital-rain/ViewModel.js';

export class DigitalRainScene {
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
        this.view.init(getColors());
        this.viewModel = new ViewModel(this.view, isMobile);
        this.viewModel.init();

        this._startRenderLoop();
        window.addEventListener('resize', this._boundResize);
        return true;
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

        if (this.view) this.view.dispose();
    }
}
