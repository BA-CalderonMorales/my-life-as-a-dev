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
                gradientTop: 0x111110,
                gradientBottom: 0x090909,
                accent: 0x31312f,
                particlePrimary: 0x888781,
                particleSecondary: 0xd2d0ca,
                waveColor: 0x3f3f3c,
                waveOpacity: 0.08,
                auroraColor: 0x2f2f2d,
            },
            'solar-chroma': {
                gradientTop: 0xf5f4ef,
                gradientBottom: 0xe6e4de,
                accent: 0xc6c3ba,
                particlePrimary: 0x6f6f6a,
                particleSecondary: 0x212121,
                waveColor: 0x87857f,
                waveOpacity: 0.06,
                auroraColor: 0xd2d0c8,
            },
            'prism-violet': {
                gradientTop: 0x171716,
                gradientBottom: 0x0b0b0b,
                accent: 0x42423f,
                particlePrimary: 0x9a9892,
                particleSecondary: 0xe0ddd6,
                waveColor: 0x50504b,
                waveOpacity: 0.07,
                auroraColor: 0x383835,
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
