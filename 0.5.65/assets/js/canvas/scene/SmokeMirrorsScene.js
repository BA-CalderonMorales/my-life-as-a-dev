/**
 * Smoke Mirrors Scene - Orchestrator
 */
import { View } from './smoke-mirrors/View.js';
import { ViewModel } from './smoke-mirrors/ViewModel.js';

export class SmokeMirrorsScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.view = null;
        this.viewModel = null;
        this.animationId = null;
        this.isDestroyed = false;

        this._handleResize = this._onResize.bind(this);
        this._handleMouseMove = this._onMouseMove.bind(this);
        this._handleMouseLeave = this._onMouseLeave.bind(this);
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
            console.error('Failed to initialize SmokeMirrorsScene:', err);
            this.destroy();
            return false;
        }
    }

    _setupListeners() {
        window.addEventListener('resize', this._boundResize);
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('mouseleave', this._handleMouseLeave);
        this.container.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this._onMouseMove(touch);
        }, { passive: true });
        this.container.addEventListener('touchend', this._handleMouseLeave);
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
            this.container.removeEventListener('mousemove', this._handleMouseMove);
            this.container.removeEventListener('mouseleave', this._handleMouseLeave);
        }

        if (this.viewModel) this.viewModel.dispose();
    }
}
