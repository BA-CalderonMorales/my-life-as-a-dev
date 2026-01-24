/**
 * Three.js Background - Main Entry Point
 * 
 * Bruno Simon-inspired immersive background experience
 * Combines multiple visual effects for maximum impact:
 * - Animated gradient background with noise
 * - Flowing wave geometry
 * - Interactive particles with constellation connections
 * - Mouse-responsive camera and effects
 * 
 * Architecture: Follows MVVM, DDD, Vertical Slice patterns
 */

import { DeviceDetector } from './utils/DeviceDetector.js';
import { ImmersiveScene } from './pages/ImmersiveScene.js';

class ThreeJSBackgroundApp {
    constructor() {
        this.currentScene = null;
        this.deviceDetector = new DeviceDetector();
        this.containerId = 'threejs-bg-container';
        this.isInitialized = false;
        this.hasLoggedWelcome = false;
    }

    /**
     * Initialize the Three.js background
     */
    async init() {
        if (this.isInitialized) return;

        if (!this.deviceDetector.shouldEnableThreeJS()) {
            return;
        }

        this.createContainer();

        // Use immersive scene with all effects for wow factor
        this.currentScene = new ImmersiveScene(this.containerId);

        const success = await this.currentScene.init();

        if (success) {
            this.isInitialized = true;
            this.hasLoggedWelcome = true;
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

            // Insert at document.body level to avoid affecting MkDocs layout
            // The CSS position:fixed ensures it stays behind all content
            document.body.insertBefore(container, document.body.firstChild);
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
