/**
 * Zen Geometry Scene - Orchestrator
 *
 * Adheres to SOLID, KISS, and MVVM principles.
 * Vertical slice that coordinates Model, View, and ViewModel.
 */
import { ZEN_GEOMETRY_THEMES, ZEN_NODE_DEFINITIONS, ZEN_CONNECTIONS } from './zen-geometry/Model.js';
import { View } from './zen-geometry/View.js';
import { ViewModel } from './zen-geometry/ViewModel.js';

export class ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.view = null;
        this.viewModel = null;
        this.animationId = null;
        this.isDestroyed = false;

        this._handleResize = this._onResize.bind(this);
        this._handleMouseMove = this._onMouseMove.bind(this);
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
        const colors = this._getColors();

        this.view = new View(this.container, colors, isMobile);
        this.view.createGeometry(ZEN_NODE_DEFINITIONS, ZEN_CONNECTIONS);

        this.viewModel = new ViewModel(this.view, ZEN_NODE_DEFINITIONS, ZEN_CONNECTIONS);

        this._setupInteraction();
        this._startRenderLoop();
        this._setupThemeObserver();

        window.addEventListener('resize', this._handleResize);
        return true;
    }

    _getColors() {
        const scheme = document.body.getAttribute('data-md-color-scheme');
        return scheme === 'slate' ? ZEN_GEOMETRY_THEMES.dark : ZEN_GEOMETRY_THEMES.light;
    }

    _setupInteraction() {
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('mouseleave', this._handleInteractionEnd);
    }

    _onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
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
            const colors = this._getColors();
            this.view.updateTheme(colors);
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
        }
        if (this.themeObserver) this.themeObserver.disconnect();
        
        if (this.view) this.view.dispose();
        
        if (this.container && this.container.parentElement && this.container.id === this.containerId) {
            // Only remove if we created it or it's the intended container
        }
    }
}
