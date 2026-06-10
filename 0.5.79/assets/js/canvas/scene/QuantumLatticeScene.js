/**
 * Quantum Lattice Scene - Orchestrator
 */
import { getColors } from './quantum-lattice/Model.js';
import { View } from './quantum-lattice/View.js';
import { ViewModel } from './quantum-lattice/ViewModel.js';

export class QuantumLatticeScene {
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

        const width = window.innerWidth;
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        const colors = getColors();

        this.view = new View(this.container, isMobile);
        this.viewModel = new ViewModel(this.view, isMobile, isTablet);
        
        try {
            this.viewModel.init(colors);
            this._startRenderLoop();
            this._setupThemeObserver();

            window.addEventListener('resize', this._handleResize);
            return true;
        } catch (err) {
            console.error('Failed to initialize QuantumLatticeScene:', err);
            this.destroy();
            return false;
        }
    }

    _onResize() {
        if (this.viewModel) this.viewModel.onResize();
    }

    _setupThemeObserver() {
        this.themeObserver = new MutationObserver(() => {
            const colors = getColors();
            if (this.view) this.view.updateTheme(colors);
            if (this.viewModel) this.viewModel.colors = colors;
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
        if (this.themeObserver) this.themeObserver.disconnect();
        
        if (this.viewModel) this.viewModel.dispose();
    }
}
