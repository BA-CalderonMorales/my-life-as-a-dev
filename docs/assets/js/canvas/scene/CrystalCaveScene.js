/**
 * Crystal Cave Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 */
import { CRYSTAL_CAVE_CONFIG } from './crystal-cave/Model.js';
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
        this._positionCanvas = this._updateCanvasPosition.bind(this);
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        this.isEmbedded = Boolean(this.container);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }

        this._updateCanvasPosition();
        window.addEventListener('resize', this._positionCanvas);
        window.addEventListener('scroll', this._positionCanvas);

        try {
            const colors = getThemeColors();
            
            this.view = new View(this.container, CRYSTAL_CAVE_CONFIG);
            this.view.init(colors);

            this.viewModel = new ViewModel(this.view);
            this.viewModel.init();

            this._startRenderLoop();
            window.addEventListener('resize', this._handleResize);
            return true;
        } catch (err) {
            this.destroy();
            return false;
        }
    }

    _updateCanvasPosition() {
        if (this.isEmbedded) {
            this.container.style.top = '';
            this.container.style.height = '';
            return;
        }

        const header = document.querySelector('.md-header');
        const footer = document.querySelector('.md-footer');

        const headerHeight = header ? header.offsetHeight : 0;
        let footerTop = window.innerHeight;

        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            if (footerRect.top < window.innerHeight && footerRect.top > headerHeight) {
                footerTop = footerRect.top;
            }
        }

        const canvasHeight = footerTop - headerHeight;
        this.container.style.top = headerHeight + 'px';
        this.container.style.height = canvasHeight + 'px';
    }

    _onResize() {
        this._updateCanvasPosition();
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

        window.removeEventListener('resize', this._handleResize);
        window.removeEventListener('resize', this._positionCanvas);
        window.removeEventListener('scroll', this._positionCanvas);

        if (this.viewModel) this.viewModel.dispose();
        if (this.view) this.view.dispose();

        if (this.container && this.container.parentElement && !this.isEmbedded) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
