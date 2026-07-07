/**
 * Three.js Background - Main Entry Point
 * Uses a scene matched to the current page context.
 */

import { DeviceDetector } from './utils/DeviceDetector.js';
import { HomePageScene } from './pages/HomePageScene.js';

class ThreeJSBackgroundApp {
    constructor() {
        this.currentScene = null;
        this.currentSceneKind = null;
        this.deviceDetector = new DeviceDetector();
        this.containerId = 'threejs-bg-container';
        this.isInitialized = false;
    }

    resolveSceneKind() {
        const explicit = document.body?.getAttribute('data-mlad-scene');
        if (explicit) {
            return explicit;
        }

        const path = window.location.pathname.endsWith('index.html')
            ? window.location.pathname.slice(0, -'index.html'.length)
            : window.location.pathname;

        if (/\/my-life-as-a-dev\/(latest\/|[0-9]+\.[0-9]+\.[0-9]+\/)?$/.test(path) || path === '/') {
            return 'home';
        }

        return 'none';
    }

    createScene(kind) {
        if (kind === 'home') {
            return new HomePageScene(this.containerId);
        }

        return null;
    }

    createContainer(kind) {
        let container = document.getElementById(this.containerId);

        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'threejs-bg-container';
            document.body.insertBefore(container, document.body.firstChild);
        }

        container.setAttribute('data-scene-kind', kind);
        return container;
    }

    removeContainer() {
        const container = document.getElementById(this.containerId);
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }

    async init() {
        if (this.isInitialized) return;

        const sceneKind = this.resolveSceneKind();
        if (sceneKind === 'none' || !this.deviceDetector.shouldEnableThreeJS()) {
            this.removeContainer();
            return;
        }

        const container = this.createContainer(sceneKind);
        this.currentScene = this.createScene(sceneKind);

        if (!this.currentScene) {
            this.removeContainer();
            return;
        }

        const success = await this.currentScene.init();
        if (!success) {
            this.currentScene = null;
            this.removeContainer();
            return;
        }

        this.currentSceneKind = sceneKind;
        this.isInitialized = true;
        container.classList.add('is-ready');
    }

    destroy() {
        if (this.currentScene) {
            this.currentScene.destroy();
            this.currentScene = null;
        }

        this.currentSceneKind = null;
        this.isInitialized = false;
        this.removeContainer();
    }

    async reinit() {
        this.destroy();
        await this.init();
    }
}

let app = null;

function initBackground() {
    if (app) {
        app.reinit();
        return;
    }

    app = new ThreeJSBackgroundApp();
    app.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackground);
} else {
    initBackground();
}

if (typeof document$ !== 'undefined') {
    document$.subscribe(() => {
        if (app) {
            app.reinit();
        }
    });
}

window.ThreeJSBackground = {
    init: initBackground,
    destroy: () => app?.destroy(),
    reinit: () => app?.reinit()
};

export { ThreeJSBackgroundApp };
