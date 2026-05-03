/**
 * Neon Geode Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 */
import { NEON_GEODE_CONFIG } from './neon-geode/Model.js';
import { View } from './neon-geode/View.js';
import { ViewModel } from './neon-geode/ViewModel.js';

export class NeonGeodeScene {
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
        const config = isMobile ? NEON_GEODE_CONFIG.mobile : NEON_GEODE_CONFIG.desktop;

        this.view = new View(this.container, isMobile);
        this.view.createEnvironment(NEON_GEODE_CONFIG.lights);
        this.view.createGeode(config.crystalCount, NEON_GEODE_CONFIG.palette);
        const sparkleVelocities = this.view.createSparkles(isMobile ? 320 : 720, NEON_GEODE_CONFIG.palette);

        this.viewModel = new ViewModel(this.view, sparkleVelocities);

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
