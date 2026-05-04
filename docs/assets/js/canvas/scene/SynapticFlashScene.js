/**
 * Synaptic Flash Scene - Orchestrator
 */
import { SYNAPTIC_FLASH_CONFIG, getColors } from './synaptic-flash/Model.js';
import { View } from './synaptic-flash/View.js';
import { ViewModel } from './synaptic-flash/ViewModel.js';

export class SynapticFlashScene {
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
        const perf = isMobile ? SYNAPTIC_FLASH_CONFIG.performance.mobile : SYNAPTIC_FLASH_CONFIG.performance.desktop;
        const colors = getColors();

        this.view = new View(this.container, isMobile);
        this.view.init(SYNAPTIC_FLASH_CONFIG, colors);

        this.viewModel = new ViewModel(this.view, perf.nodeCount);
        const { positions, edges } = this.viewModel.init();
        
        this.view.createNodes(positions, perf.sphereSize, colors);
        this.view.createConnections(edges, colors.lineColor, SYNAPTIC_FLASH_CONFIG.colors.lineOpacity);

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
                this.view.nodes.forEach(n => {
                    n.material.color.setHex(colors.nodeColor);
                    n.material.emissive.setHex(colors.glowColor);
                });
                this.view.connections.forEach(c => c.material.color.setHex(colors.lineColor));
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
