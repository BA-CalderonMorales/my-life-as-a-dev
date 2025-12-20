/**
 * Three.js Background - Main Entry Point
 * 
 * Bruno Simon inspired ambient particle background
 * Creates a full-screen, immersive particle field that flows gently
 * and complements the page content without being distracting.
 * 
 * - Subtle, full-viewport coverage
 * - Theme-aware (dark/light mode)
 * - Mouse-responsive camera
 * - Performance-optimized with shader-based animations
 */

import { DeviceDetector } from './utils/DeviceDetector.js';
import { AmbientParticleScene } from './pages/AmbientParticleScene.js';

class ThreeJSBackgroundApp {
    constructor() {
        this.currentScene = null;
        this.deviceDetector = new DeviceDetector();
        this.containerId = 'threejs-bg-container';
        this.isInitialized = false;
    }

    /**
     * Initialize the Three.js background
     */
    async init() {
        if (this.isInitialized) return;

        if (!this.deviceDetector.shouldEnableThreeJS()) {
            console.info('[ThreeJSBackground] Disabled: WebGL not supported or reduced motion preferred');
            return;
        }

        this.createContainer();

        // Use ambient particle scene for all pages
        // It provides a subtle, full-screen background that complements content
        this.currentScene = new AmbientParticleScene(this.containerId);

        const success = await this.currentScene.init();

        if (success) {
            this.isInitialized = true;
            console.info('[ThreeJSBackground] Initialized (ambient particles mode)');
        }
    }

    /**
     * Create the container element for the Three.js canvas
     */
    createContainer() {
        let container = document.getElementById(this.containerId);

        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'threejs-bg-container';

            const contentWrapper = document.querySelector('.md-content') || document.querySelector('main');
            if (!contentWrapper) {
                console.warn('[ThreeJSBackground] Could not find content wrapper (.md-content or main)');
                document.body.insertBefore(container, document.body.firstChild);
            } else {
                contentWrapper.insertBefore(container, contentWrapper.firstChild);
            }
        }

        return container;
    }

    /**
     * Destroy the current scene and clean up
     */
    destroy() {
        if (this.currentScene) {
            this.currentScene.destroy();
            this.currentScene = null;
        }

        const container = document.getElementById(this.containerId);
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }

        this.isInitialized = false;
    }

    /**
     * Reinitialize for page navigation (MkDocs Material instant loading)
     */
    async reinit() {
        this.destroy();
        await this.init();
    }
}

let app = null;

/**
 * Initialize the background when DOM is ready
 */
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
