/**
 * Quantum Lattice Scene - Orchestrator
 */
import { QUANTUM_LATTICE_CONFIG, getColors } from './quantum-lattice/Model.js';
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
        const perf = isMobile ? QUANTUM_LATTICE_CONFIG.performance.mobile : (isTablet ? QUANTUM_LATTICE_CONFIG.performance.tablet : QUANTUM_LATTICE_CONFIG.performance.desktop);
        const colors = getColors();

        this.view = new View(this.container, isMobile, isTablet);
        this.view.init(colors, QUANTUM_LATTICE_CONFIG);
        this.view.createLattice(perf.gridSize, perf.octaSize, perf.gridSize**3, colors);

        this.viewModel = new ViewModel(this.view, perf.gridSize, perf.spacing, colors);
        this.viewModel.init();

        this._setupInteraction();
        this._startRenderLoop();
        this._setupThemeObserver();

        window.addEventListener('resize', this._handleResize);
        return true;
    }

    _setupInteraction() {
        // Lattice specific interaction could go here
    }

    _onResize() {
        if (this.view) this.view.onResize();
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
        if (this.view) this.view.dispose();
    }
}
