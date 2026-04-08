/**
 * Canvas Scene Entry Point
 *
 * Lightweight bootstrap that handles page detection and lifecycle
 * for the Zen Geometry scene. Works with MkDocs instant navigation.
 */

(function () {
    'use strict';

    let sceneInstance = null;

    function isCanvasPage() {
        return window.location.pathname.includes('/canvas/');
    }

    async function initScene() {
        if (!isCanvasPage()) return;
        if (sceneInstance) return;

        try {
            // Dynamic import of the modular scene
            const { ZenGeometryScene } = await import('./ZenGeometryScene.js');

            sceneInstance = new ZenGeometryScene();
            const success = await sceneInstance.init();

            if (!success) {
                sceneInstance = null;
            }
        } catch (err) {
            console.error('Failed to load Zen Geometry Scene:', err);
            sceneInstance = null;
        }
    }

    function cleanup() {
        if (sceneInstance) {
            sceneInstance.destroy();
            sceneInstance = null;
        }
    }

    function checkPage() {
        if (isCanvasPage()) {
            if (!sceneInstance) {
                initScene();
            }
        } else {
            if (sceneInstance) {
                cleanup();
            }
        }
    }

    // Initial check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkPage);
    } else {
        checkPage();
    }

    // Track URL changes for instant navigation
    let lastPathname = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== lastPathname) {
            lastPathname = window.location.pathname;
            checkPage();
        }
    }, 100);

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        setTimeout(checkPage, 50);
    });

})();
