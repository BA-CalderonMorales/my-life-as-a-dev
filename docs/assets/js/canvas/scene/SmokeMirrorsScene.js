/**
 * Smoke Mirrors Scene - Orchestrator
 */
import { SMOKE_MIRRORS_CONFIG, getColors } from './smoke-mirrors/Model.js';
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
        const perf = isMobile ? SMOKE_MIRRORS_CONFIG.performance.mobile : SMOKE_MIRRORS_CONFIG.performance.desktop;
        const colors = getColors();

        this.view = new View(this.container, isMobile);
        this.view.init(SMOKE_MIRRORS_CONFIG);
        const initialPositions = this.view.createParticles(perf.particleCount, perf.size, SMOKE_MIRRORS_CONFIG.colors);
        this.view.createMirrors(SMOKE_MIRRORS_CONFIG.mirrorPositions, SMOKE_MIRRORS_CONFIG.colors.mirror);

        this.viewModel = new ViewModel(this.view, perf.particleCount);
        this.viewModel.init(initialPositions);

        this._setupListeners();
        this._startRenderLoop();
        this._setupThemeObserver();

        return true;
    }

    _setupListeners() {
        window.addEventListener('resize', this._handleResize);
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
        if (this.view) this.view.onResize();
    }

    _setupThemeObserver() {
        this.themeObserver = new MutationObserver(() => {
            const colors = getColors();
            this.view.scene.background.setHex(colors.background);
            this.view.scene.fog.color.setHex(colors.background);
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
