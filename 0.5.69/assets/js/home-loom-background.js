(function () {
    'use strict';

    let backgroundModulePromise = null;

    function isHomePage() {
        return document.body?.classList.contains('landing-page');
    }

    function ensureBackground() {
        if (!isHomePage()) return;

        if (!backgroundModulePromise) {
            backgroundModulePromise = import('./threejs-background/main.js');
        } else {
            backgroundModulePromise.then(() => window.ThreeJSBackground?.reinit?.());
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureBackground);
    } else {
        ensureBackground();
    }

    if (typeof document$ !== 'undefined') {
        document$.subscribe(() => {
            setTimeout(ensureBackground, 50);
        });
    }
})();
