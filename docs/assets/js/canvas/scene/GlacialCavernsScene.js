/**
 * Glacial Caverns Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 * Uses InstancedMesh for performance.
 */
import { GLACIAL_CONFIG } from './glacial-caverns/Model.js';
import { View } from './glacial-caverns/View.js';
import { ViewModel } from './glacial-caverns/ViewModel.js';

export class GlacialCavernsScene {
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
        const config = isMobile ? GLACIAL_CONFIG.mobile : GLACIAL_CONFIG.desktop;

        this.view = new View(this.container, isMobile);
        const blockConfigs = this.view.createCavern(
            GLACIAL_CONFIG.lightPositions,
            config.blockCount,
            GLACIAL_CONFIG.iceColors
        );

        this.viewModel = new ViewModel(this.view, blockConfigs);

        this._startRenderLoop();
        window.addEventListener('resize', this._boundResize);
        return true;
    }

    _onResize() {
        this.view.onResize();
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
