/**
 * String Theory Scene - Orchestrator
 */
import { STRING_THEORY_CONFIG, getColors } from './string-theory/Model.js';
import { View } from './string-theory/View.js';
import { ViewModel } from './string-theory/ViewModel.js';

export class StringTheoryScene {
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
        const perf = isMobile ? STRING_THEORY_CONFIG.performance.mobile : STRING_THEORY_CONFIG.performance.desktop;
        const colors = getColors();

        this.view = new View(this.container, isMobile);
        this.view.init(STRING_THEORY_CONFIG, colors);
        this.view.createStrings(perf.stringCount, perf.stringLength, colors.lineColor, STRING_THEORY_CONFIG.colors.opacity);

        this.viewModel = new ViewModel(this.view, perf.stringCount, perf.stringLength);
        this.viewModel.init();

        this._startRenderLoop();
        this._setupThemeObserver();

        window.addEventListener('resize', this._boundResize);
        return true;
    }

    _onResize() {
        if (this.view) this.view.onResize();
    }

    _setupThemeObserver() {
        this.themeObserver = new MutationObserver(() => {
            const colors = getColors();
            if (this.view) {
                this.view.scene.background.setHex(colors.background);
                this.view.scene.fog.color.setHex(colors.background);
                this.view.strings.forEach(s => s.material.color.setHex(colors.lineColor));
            }
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
        window.removeEventListener('resize', this._boundResize);
        if (this.themeObserver) this.themeObserver.disconnect();
        if (this.view) this.view.dispose();
    }
}
