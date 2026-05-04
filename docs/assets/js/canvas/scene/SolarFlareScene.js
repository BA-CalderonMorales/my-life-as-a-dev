/**
 * Solar Flare Scene - Orchestrator
 */
import { SOLAR_FLARE_CONFIG } from './solar-flare/Model.js';
import { View } from './solar-flare/View.js';
import { ViewModel } from './solar-flare/ViewModel.js';

export class SolarFlareScene {
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
        const perf = isMobile ? SOLAR_FLARE_CONFIG.performance.mobile : SOLAR_FLARE_CONFIG.performance.desktop;

        this.view = new View(this.container, isMobile);
        this.view.init(SOLAR_FLARE_CONFIG);
        this.view.createParticles(perf.particleCount, perf.size);

        this.viewModel = new ViewModel(this.view, perf.particleCount);
        this.viewModel.init(true);

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
