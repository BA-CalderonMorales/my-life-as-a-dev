/**
 * Echo Chains Scene - Orchestrator
 */
import { getColors } from './echo-chains/Model.js';
import { View } from './echo-chains/View.js';
import { ViewModel } from './echo-chains/ViewModel.js';

export class EchoChainsScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.view = null;
        this.viewModel = null;
        this.animationId = null;
        this.isDestroyed = false;

        this._handleResize = this._onResize.bind(this);
        this._handleMouseMove = this._onMouseMove.bind(this);
        this._handleInteractionEnd = this._onInteractionEnd.bind(this);
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }

        const isMobile = window.innerWidth < 768;
        const colors = getColors();

        this.view = new View(this.container, isMobile);
        this.viewModel = new ViewModel(this.view, isMobile);
        
        try {
            this.viewModel.init(colors);
            this._setupInteraction();
            this._startRenderLoop();
            this._setupThemeObserver();

            window.addEventListener('resize', this._handleResize);
            return true;
        } catch (err) {
            console.error('Failed to initialize EchoChainsScene:', err);
            this.destroy();
            return false;
        }
    }

    _setupInteraction() {
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('mouseleave', this._handleInteractionEnd);
    }

    _onMouseMove(event) {
        if (!this.viewModel) return;
        const rect = this.container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.viewModel.handleMouseMove(x, y);
    }

    _onInteractionEnd() {
        if (this.viewModel) this.viewModel.handleInteractionEnd();
    }

    _onResize() {
        if (this.viewModel) this.viewModel.onResize();
    }

    _setupThemeObserver() {
        this.themeObserver = new MutationObserver(() => {
            const colors = getColors();
            if (this.view) this.view.updateTheme(colors);
        });
        this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });
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
        window.removeEventListener('resize', this._handleResize);
        if (this.container) {
            this.container.removeEventListener('mousemove', this._handleMouseMove);
            this.container.removeEventListener('mouseleave', this._handleInteractionEnd);
        }
        if (this.themeObserver) this.themeObserver.disconnect();
        
        if (this.viewModel) this.viewModel.dispose();
    }
}
