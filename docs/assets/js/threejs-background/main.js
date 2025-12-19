/**
 * Three.js Background - Main Entry Point
 * 
 * Architecture: MVVM + DDD + Vertical Slice
 * - core/: Scene management (ViewModel layer)
 * - lighting/: Lighting domain
 * - animation/: Animation domain (geometry, controllers)
 * - pages/: Vertical slice implementations per page type
 * - utils/: Cross-cutting utilities
 * 
 * Inspired by Bruno Simon and creative Three.js portfolios
 */

import { DeviceDetector } from './utils/DeviceDetector.js';
import { HomePageScene } from './pages/HomePageScene.js';
import { SubtlePageScene } from './pages/SubtlePageScene.js';

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
        
        const isHomePage = this.detectHomePage();
        
        if (isHomePage) {
            this.currentScene = new HomePageScene(this.containerId);
        } else {
            this.currentScene = new SubtlePageScene(this.containerId);
        }
        
        const success = await this.currentScene.init();
        
        if (success) {
            this.isInitialized = true;
            console.info(`[ThreeJSBackground] Initialized (${isHomePage ? 'home' : 'subtle'} mode)`);
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
            
            const contentWrapper = document.querySelector('.md-content') || document.body;
            contentWrapper.insertBefore(container, contentWrapper.firstChild);
        }
        
        return container;
    }
    
    /**
     * Detect if current page is the home page
     */
    detectHomePage() {
        const path = window.location.pathname;
        
        const isRoot = path === '/' || path === '/index.html';
        
        const hasLandingClass = document.body.classList.contains('landing-page');
        
        const isVersionedRoot = /^\/[^/]+\/?$/.test(path) || /\/latest\/?$/.test(path);
        
        const hasMikeVersion = document.querySelector('.md-version') !== null;
        const isDocRoot = hasMikeVersion && (isRoot || isVersionedRoot);
        
        return isRoot || hasLandingClass || isDocRoot;
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
