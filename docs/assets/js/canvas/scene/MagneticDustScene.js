/**
 * Magnetic Dust Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 */
import { MAGNETIC_DUST_CONFIG } from './magnetic-dust/Model.js';
import { View } from './magnetic-dust/View.js';
import { ViewModel } from './magnetic-dust/ViewModel.js';

export class MagneticDustScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.view = null;
        this.viewModel = null;
        this.animationId = null;
        this.isDestroyed = false;

        this._boundResize = this._onResize.bind(this);
        this._boundMouseMove = this._onMouseMove.bind(this);
        this._boundMouseLeave = this._onMouseLeave.bind(this);
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
        this.view.init(MAGNETIC_DUST_CONFIG);

        this.viewModel = new ViewModel(this.view);

        this._setupListeners();
        this._startRenderLoop();
        
        return true;
    }

    _setupListeners() {
        window.addEventListener('resize', this._boundResize);
        this.container.addEventListener('mousemove', this._boundMouseMove);
        this.container.addEventListener('mouseleave', this._boundMouseLeave);
        this.container.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this._onMouseMove(touch);
        }, { passive: true });
        this.container.addEventListener('touchend', this._boundMouseLeave);
    }

    _onMouseMove(event) {
        if (!this.viewModel) return;
        const rect = this.container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.viewModel.handleMouseMove(x, y);
    }

    _onMouseLeave() {
        if (this.viewModel) this.viewModel.handleInteractionEnd();
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
            this.container.removeEventListener('mousemove', this._boundMouseMove);
            this.container.removeEventListener('mouseleave', this._boundMouseLeave);
        }

        if (this.view) this.view.dispose();
    }
}
