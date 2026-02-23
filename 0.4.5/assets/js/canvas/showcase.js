import { ImmersiveScene } from '../threejs-background/pages/ImmersiveScene.js';
import { DeviceDetector } from '../threejs-background/utils/DeviceDetector.js';

class CanvasShowcase {
    constructor(containerId) {
        this.containerId = containerId;
        this.scene = null;
        this.deviceDetector = new DeviceDetector();
        this.modeButtons = [];
        this.activeMode = null;
        this.stageElement = null;
        this.expandButton = null;

        this.handleModeClick = this.handleModeClick.bind(this);
        this.handleExpandClick = this.handleExpandClick.bind(this);
        this.handleFullscreenChange = this.handleFullscreenChange.bind(this);

        this.customPalettes = {
            'teal-ember': {
                gradientTop: 0x0f1129,
                gradientBottom: 0x05060f,
                accent: 0x00fff2,
                particlePrimary: 0x00f5d4,
                particleSecondary: 0xff9f68,
                waveColor: 0x00d4aa,
                waveOpacity: 0.22,
                auroraColor: 0x1cc9b5,
            },
            'solar-chroma': {
                gradientTop: 0x28100d,
                gradientBottom: 0x060301,
                accent: 0xffae00,
                particlePrimary: 0xffda79,
                particleSecondary: 0xff6b6b,
                waveColor: 0xff914d,
                waveOpacity: 0.18,
                auroraColor: 0xffc857,
            },
            'prism-violet': {
                gradientTop: 0x160733,
                gradientBottom: 0x04020d,
                accent: 0xaf7eff,
                particlePrimary: 0xaf7eff,
                particleSecondary: 0x66e4ff,
                waveColor: 0x7c4dff,
                waveOpacity: 0.2,
                auroraColor: 0xb388ff,
            }
        };
    }

    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (this.deviceDetector.prefersReducedMotion()) {
            container.setAttribute('data-canvas-disabled', 'true');
            return;
        } else {
            container.removeAttribute('data-canvas-disabled');
        }

        await this.destroy();

        this.scene = new ImmersiveScene(this.containerId);
        const success = await this.scene.init();

        if (!success) {
            this.scene = null;
            return;
        }

        this.stageElement = document.querySelector('.canvas-stage');
        this.expandButton = document.querySelector('[data-canvas-expand]');

        this.injectPalettes();
        this.bindControls();
        this.bindExpandControl();

        const initialMode = this.modeButtons.find(btn => btn.classList.contains('is-active'))?.dataset.canvasMode
            || Object.keys(this.customPalettes)[0];

        this.applyMode(initialMode);

        // Nudge camera closer for gallery view
        if (this.scene.camera) {
            this.scene.camera.position.z = 40;
        }
    }

    injectPalettes() {
        if (!this.scene) return;

        this.scene.themes = {
            ...this.scene.themes,
            ...this.customPalettes,
        };
    }

    bindControls() {
        this.modeButtons = Array.from(document.querySelectorAll('[data-canvas-mode]'));
        this.modeButtons.forEach(btn => btn.addEventListener('click', this.handleModeClick));
    }

    bindExpandControl() {
        if (!this.expandButton) return;
        this.expandButton.addEventListener('click', this.handleExpandClick);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        this.updateExpandLabel(false);
    }

    handleModeClick(event) {
        event.preventDefault();
        const mode = event.currentTarget.dataset.canvasMode;
        this.applyMode(mode);
    }

    applyMode(mode) {
        if (!this.scene || !this.scene.themes[mode]) return;

        this.scene.currentTheme = mode;
        this.scene.applyTheme();
        this.activeMode = mode;

        this.modeButtons.forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.canvasMode === mode);
        });
    }

    handleExpandClick(event) {
        event.preventDefault();
        const isExpanded = this.stageElement?.getAttribute('data-canvas-expanded') === 'true';
        const nextState = !isExpanded;
        this.setExpandedState(nextState);

        if (nextState && this.stageElement?.requestFullscreen) {
            this.stageElement.requestFullscreen().catch(() => {
                this.setExpandedState(false);
            });
        } else if (!nextState && document.fullscreenElement) {
            document.exitFullscreen?.();
        }
    }

    handleFullscreenChange() {
        const isFullscreen = document.fullscreenElement === this.stageElement;
        this.setExpandedState(isFullscreen);
    }

    setExpandedState(enabled) {
        if (!this.stageElement) return;
        this.stageElement.setAttribute('data-canvas-expanded', String(enabled));
        this.updateExpandLabel(enabled);
    }

    updateExpandLabel(enabled) {
        if (!this.expandButton) return;
        this.expandButton.textContent = enabled ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }

    async destroy() {
        this.modeButtons.forEach(btn => btn.removeEventListener('click', this.handleModeClick));
        this.modeButtons = [];

        if (this.expandButton) {
            this.expandButton.removeEventListener('click', this.handleExpandClick);
        }

        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);

        if (this.scene) {
            this.scene.destroy();
            this.scene = null;
        }
    }
}

let showcaseInstance = null;

async function initCanvasShowcase() {
    const containerExists = document.getElementById('canvas-playground');

    if (!containerExists) {
        if (showcaseInstance) {
            await showcaseInstance.destroy();
            showcaseInstance = null;
        }
        return;
    }

    if (!showcaseInstance) {
        showcaseInstance = new CanvasShowcase('canvas-playground');
    }

    await showcaseInstance.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvasShowcase);
} else {
    initCanvasShowcase();
}

if (typeof document$ !== 'undefined') {
    document$.subscribe(() => {
        initCanvasShowcase();
    });
}
