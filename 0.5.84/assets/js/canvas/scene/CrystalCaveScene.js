/**
 * Crystal Cave Scene - Orchestrator
 */
import { View } from './crystal-cave/View.js';
import { ViewModel } from './crystal-cave/ViewModel.js';
import { getThemeColors } from './themes/ThemeConfig.js';

export class CrystalCaveScene {
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
        const colors = getThemeColors();

        this.view = new View(this.container);
        this.viewModel = new ViewModel(this.view, isMobile);
        
        try {
            this.viewModel.init(colors);
            this._startRenderLoop();
            window.addEventListener('resize', this._handleResize);
            return true;
        } catch (err) {
            console.error('Failed to initialize CrystalCaveScene:', err);
            this.destroy();
            return false;
        }
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
        window.removeEventListener('resize', this._handleResize);

        if (this.viewModel) this.viewModel.dispose();
    }
}
