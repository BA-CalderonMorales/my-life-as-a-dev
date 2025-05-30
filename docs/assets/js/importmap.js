/**
 * Simple Module Loader
 * Serves as a centralized entry point for loading all JavaScript modules
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
            // Core scripts
            { path: "assets/js/core/logger.js", type: "module" },
            { path: "assets/js/core/interactivity-utils.js", type: "module" },  // Added core utility
            { path: "assets/js/core/scrollEffects.js", type: "module" },        // Added core utility
            
            // Components
            { path: "assets/js/components/ambient-background/ambient-background.js", type: "module" },
            
            // Page scripts
            { path: "assets/js/pages/home/landingPage.js", type: "module" },
            { path: "assets/js/pages/home/sectionTransitions.js", type: "module" },
            { path: "assets/js/pages/home/smoothScroll.js", type: "module" },
            { path: "assets/js/pages/aiPlayground/aiPlayground.js", type: "module" },
            
            // Component scripts - Test Scenes
            { path: "assets/js/components/dreamscape/dreamscape.js", type: "module" },
            { path: "assets/js/components/dreamscape-proto4/dreamscape-proto4.js", type: "module" },
            { path: "assets/js/components/dreamscape-proto6/dreamscape-proto6.js", type: "module" },
            { path: "assets/js/components/ghibli-masterpiece/ghibli-masterpiece.js", type: "module" },
            { path: "assets/js/components/cellular-prism/cellular-prism.js", type: "module" },
            { path: "assets/js/components/color-particle-artifact/color-particle-artifact.js", type: "module" },
            { path: "assets/js/components/physics-playground/physics-playground.js", type: "module" },
            { path: "assets/js/components/kaleidoscopic-scene/kaleidoscopic-scene.js", type: "module" },
            { path: "assets/js/components/intergalactic-scene/intergalactic-scene.js", type: "module" },
        ];

        // Create container for three.js background early
        if (!document.getElementById('three-background')) {
            const bgContainer = document.createElement('div');
            bgContainer.id = 'three-background';
            document.body.prepend(bgContainer);
        }

        // Load all scripts in order
        let loadedScripts = 0;
        const totalScripts = scripts.length;
        
        scripts.forEach(script => {
            const scriptElement = document.createElement('script');
            scriptElement.type = script.type || 'text/javascript';
            scriptElement.src = script.path;
            document.body.appendChild(scriptElement);

            // Add error handling to help with debugging
            scriptElement.onerror = () => {
                console.warn(`Failed to load: ${script.path}`);
                checkAllLoaded();
            };

            scriptElement.onload = () => {
                console.log(`Successfully loaded: ${script.path}`);
                checkAllLoaded();
            };
        });
        
        function checkAllLoaded() {
            loadedScripts++;
            if (loadedScripts === totalScripts) {
                console.log('All scripts loaded via importmap.js');
                initializeThreeJsBackground();
            }
        }
    };
    
    // Initialize the ambient background after all scripts are loaded
    const initializeThreeJsBackground = async () => {
        try {
            // Get the AmbientBackground class - Use consistent path
            const { default: AmbientBackground } = await import('./components/ambient-background/ambient-background.js');
            
            // Initialize the ambient background
            window.ambientBackground = new AmbientBackground({
                particleCount: 800,
                speed: 0.05,
                colorMode: 'theme'
            });
            
            console.log("Ambient background initialized");
        } catch (error) {
            console.error("Failed to initialize ambient background:", error);
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        setupThreeJsImports();
        loadScripts();
    });
})();