/**
 * Simple Module Loader
 * Serves as a centralized entry point for loading all JavaScript modules
 * 
 * Note: CSS is loaded via importmap.css which provides a similar structure for styles:
 * - Theme variables (theme-colors.css)
 * - Core styles (core/index.css)
 * - Component styles (components/index.css)
 * - Landing page styles (landing-page/index.css)
 */
(function () {

    // Set up Three.js CDN imports
    const setupThreeJsImports = () => {

        if (document.querySelector('script[type="importmap"]')) {
            return;
        }

        const importMap = document.createElement('script');
        importMap.type = 'importmap';
        importMap.textContent = JSON.stringify({
            imports: {
                "three": "https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js",
                "three/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/"
            }
        });

        document.head.appendChild(importMap);
    };

    // Load all scripts from mkdocs.yml
    const loadScripts = () => {
        // All scripts from mkdocs.yml extra_javascript (minus importmap.js itself)
        const scripts = [
            { path: "assets/js/custom/ghibli-symphony.js", type: "text/javascript" }, // New Ghibli-inspired UI script
            { path: "assets/js/vendor/typewriter.min.js", type: "module" },
            { path: "assets/js/custom/particleBackground.js", type: "module" },
            { path: "assets/js/custom/initParticles.js", type: "module" },
            { path: "assets/js/custom/versionSelector.js", type: "module" },
            { path: "assets/js/custom/logger.js", type: "module" },
            { path: "assets/js/custom/interactivity-utils.js", type: "module" },
            { path: "assets/js/custom/landingPage.js", type: "module" },
            { path: "assets/js/custom/typewriter-init.js", type: "module" },
            { path: "assets/js/custom/typewriter-fallback.js", type: "module" },
            { path: "assets/js/custom/smoothScroll.js", type: "module" },
            { path: "assets/js/custom/performanceMonitor.js", type: "module" },
            { path: "assets/js/custom/sectionTransitions.js", type: "module" },
            { path: "assets/js/custom/initModernUI.js", type: "module" },
            { path: "assets/js/components/dreamscape/dreamscape.js", type: "module" },
            { path: "assets/js/components/dreamscape-proto4/dreamscape-proto4.js", type: "module" },
            { path: "assets/js/components/dreamscape-proto6/dreamscape-proto6.js", type: "module" },
            { path: "assets/js/components/ghibli-masterpiece/ghibli-masterpiece.js", type: "module" },
            { path: "assets/js/components/cellular-prism/cellular-prism.js", type: "module" },
            { path: "assets/js/components/color-particle-artifact/color-particle-artifact.js", type: "module" },
            { path: "assets/js/components/physics-playground/physics-playground.js", type: "module" },
            { path: "assets/js/components/kaleidoscopic-scene/kaleidoscopic-scene.js", type: "module" },
            { path: "assets/js/components/intergalactic-scene/intergalactic-scene.js", type: "module" },
            { path: "assets/js/components/aiPlayground/aiPlayground.js", type: "module" }
        ];

        // Load all scripts in order
        scripts.forEach(script => {
            const scriptElement = document.createElement('script');
            scriptElement.type = script.type || 'text/javascript';
            // Remove the leading slash that was causing 404 errors
            scriptElement.src = script.path;
            document.body.appendChild(scriptElement);

            // Add error handling to help with debugging
            scriptElement.onerror = () => {
                console.warn(`Failed to load: ${ script.path }`);
            };

            scriptElement.onload = () => {
                console.log(`Successfully loaded: ${ script.path }`);
            };
        });

        console.log('All scripts loaded via importmap.js');
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        setupThreeJsImports();
        loadScripts();
    });

})();