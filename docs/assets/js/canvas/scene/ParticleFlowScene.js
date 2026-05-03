/**
 * Particle Flow Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 */
import { PARTICLE_FLOW_CONFIG, getColors } from './particle-flow/Model.js';
import { View } from './particle-flow/View.js';
import { ViewModel } from './particle-flow/ViewModel.js';

export class ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.view = null;
        this.viewModel = null;
        this.animationId = null;
        this.isDestroyed = false;

        this._handleResize = this._onResize.bind(this);
        this._handleMouseMove = this._onPointerMove.bind(this);
        this._handleTouchMove = this._onTouchMove.bind(this);
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
        const config = isMobile ? PARTICLE_FLOW_CONFIG.mobile : PARTICLE_FLOW_CONFIG.desktop;
        const colors = getColors();

        this.view = new View(this.container, colors, isMobile);
        this.view.createParticles(config.count, config.size);

        this.viewModel = new ViewModel(this.view, config.count, colors);

        this._setupInteraction();
        this._startRenderLoop();
        this._setupThemeObserver();

        window.addEventListener('resize', this._handleResize);
        return true;
    }

    _setupInteraction() {
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('mouseleave', this._handleInteractionEnd);
        this.container.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        this.container.addEventListener('touchend', this._handleInteractionEnd);
        this.container.addEventListener('touchcancel', this._handleInteractionEnd);
    }

    _onPointerMove(e) {
        this._setPointerPosition(e.clientX, e.clientY);
    }

    _onTouchMove(e) {
        if (!e.touches.length) return;
        e.preventDefault();
        this._setPointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    }

    _setPointerPosition(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.viewModel.handleMouseMove(x, y);
    }

    _onInteractionEnd() {
        this.viewModel.handleInteractionEnd();
    }

    _onResize() {
        this.view.onResize();
    }

    _setupThemeObserver() {
        this.themeObserver = new MutationObserver(() => {
            const colors = getColors();
            this.view.updateTheme(colors);
            this.viewModel.updateThemeColors(colors);
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
            this.container.removeEventListener('touchmove', this._handleTouchMove);
            this.container.removeEventListener('touchend', this._handleInteractionEnd);
            this.container.removeEventListener('touchcancel', this._handleInteractionEnd);
        }
        if (this.themeObserver) this.themeObserver.disconnect();
        
        if (this.view) this.view.dispose();
    }
}
