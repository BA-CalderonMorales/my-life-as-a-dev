/**
 * Canvas Scene Entry Point
 *
 * Lightweight bootstrap that handles page detection and lifecycle
 * for the Canvas scenes. Works with MkDocs instant navigation.
 */

(function () {
    'use strict';

    const SCENE_REGISTRY = [
        {
            slug: 'zen-geometry',
            path: '/canvas/zen-geometry/',
            title: 'The Calm Network',
            modulePath: './ZenGeometryScene.js',
            exportName: 'ZenGeometryScene',
        },
        {
            slug: 'crystal-cave',
            path: '/canvas/crystal-cave/',
            title: 'Amethyst Vault',
            modulePath: './CrystalCaveScene.js',
            exportName: 'CrystalCaveScene',
        },
        {
            slug: 'particle-flow',
            path: '/canvas/particle-flow/',
            title: 'Kinetic Ocean',
            modulePath: './ParticleFlowScene.js',
            exportName: 'ParticleFlowScene',
        },
        {
            slug: 'quantum-lattice',
            path: '/canvas/quantum-lattice/',
            title: 'Quantum Lattice',
            modulePath: './QuantumLatticeScene.js',
            exportName: 'QuantumLatticeScene',
        },
        {
            slug: 'neon-geode',
            path: '/canvas/neon-geode/',
            title: 'Neon Geode',
            modulePath: './NeonGeodeScene.js',
            exportName: 'NeonGeodeScene',
        },
        {
            slug: 'magnetic-dust',
            path: '/canvas/magnetic-dust/',
            title: 'Magnetic Dust',
            modulePath: './MagneticDustScene.js',
            exportName: 'MagneticDustScene',
        },
        {
            slug: 'origami-unfolding',
            path: '/canvas/origami-unfolding/',
            title: 'Origami Unfolding',
            modulePath: './OrigamiUnfoldingScene.js',
            exportName: 'OrigamiUnfoldingScene',
        },
        {
            slug: 'glacial-caverns',
            path: '/canvas/glacial-caverns/',
            title: 'Glacial Caverns',
            modulePath: './GlacialCavernsScene.js',
            exportName: 'GlacialCavernsScene',
        },
        {
            slug: 'solar-flare',
            path: '/canvas/solar-flare/',
            title: 'Solar Flare',
            modulePath: './SolarFlareScene.js',
            exportName: 'SolarFlareScene',
        },
        {
            slug: 'string-theory',
            path: '/canvas/string-theory/',
            title: 'String Theory',
            modulePath: './StringTheoryScene.js',
            exportName: 'StringTheoryScene',
        },
        {
            slug: 'bismuth-fracture',
            path: '/canvas/bismuth-fracture/',
            title: 'Bismuth Fracture',
            modulePath: './BismuthFractureScene.js',
            exportName: 'BismuthFractureScene',
        },
        {
            slug: 'digital-rain',
            path: '/canvas/digital-rain/',
            title: 'Digital Rain',
            modulePath: './DigitalRainScene.js',
            exportName: 'DigitalRainScene',
        },
        {
            slug: 'echo-chains',
            path: '/canvas/echo-chains/',
            title: 'Echo Chains',
            modulePath: './EchoChainsScene.js',
            exportName: 'EchoChainsScene',
        },
        {
            slug: 'obsidian-shards',
            path: '/canvas/obsidian-shards/',
            title: 'Obsidian Shards',
            modulePath: './ObsidianShardsScene.js',
            exportName: 'ObsidianShardsScene',
        },
        {
            slug: 'smoke-mirrors',
            path: '/canvas/smoke-mirrors/',
            title: 'Smoke & Mirrors',
            modulePath: './SmokeMirrorsScene.js',
            exportName: 'SmokeMirrorsScene',
        },
        {
            slug: 'the-loom',
            path: '/canvas/the-loom/',
            title: 'The Loom',
            modulePath: './TheLoomScene.js',
            exportName: 'TheLoomScene',
        },
        {
            slug: 'radioactive-slag',
            path: '/canvas/radioactive-slag/',
            title: 'Radioactive Slag',
            modulePath: './RadioactiveSlagScene.js',
            exportName: 'RadioactiveSlagScene',
        },
        {
            slug: 'tidal-pool',
            path: '/canvas/tidal-pool/',
            title: 'Tidal Pool',
            modulePath: './TidalPoolScene.js',
            exportName: 'TidalPoolScene',
        },
        {
            slug: 'synaptic-flash',
            path: '/canvas/synaptic-flash/',
            title: 'Synaptic Flash',
            modulePath: './SynapticFlashScene.js',
            exportName: 'SynapticFlashScene',
        },
        {
            slug: 'holographic-sand',
            path: '/canvas/holographic-sand/',
            title: 'Holographic Sand',
            modulePath: './HolographicSandScene.js',
            exportName: 'HolographicSandScene',
        },
    ];

    let sceneInstance = null;
    let currentSceneSlug = null;

    function normalizePath(pathname) {
        return pathname.endsWith('index.html') ? pathname.slice(0, -'index.html'.length) : pathname;
    }

    function getSceneDefinition() {
        const path = normalizePath(window.location.pathname);
        return SCENE_REGISTRY.find((scene) => path.includes(scene.path)) || null;
    }

    function getViewport() {
        return document.getElementById('canvas-scene');
    }

    function setViewportState(definition, state) {
        const viewport = getViewport();
        if (!viewport) return;

        viewport.dataset.canvasScene = definition.slug;
        viewport.tabIndex = 0;
        viewport.setAttribute('aria-label', `Interactive Three.js ${definition.title} scene`);
        viewport.classList.toggle('is-loading', state === 'loading');
        viewport.classList.toggle('is-ready', state === 'ready');
        viewport.classList.toggle('has-error', state === 'error');
    }

    function clearViewportState() {
        const viewport = getViewport();
        if (!viewport) return;

        delete viewport.dataset.canvasScene;
        viewport.classList.remove('is-loading', 'is-ready', 'has-error');
    }

    async function createScene(definition) {
        const sceneModule = await import(definition.modulePath);
        const SceneClass = sceneModule[definition.exportName];

        if (!SceneClass) {
            throw new Error(`Scene export not found: ${definition.exportName}`);
        }

        return new SceneClass();
    }

    async function initScene() {
        const definition = getSceneDefinition();
        if (!definition) return;
        if (sceneInstance) return;

        setViewportState(definition, 'loading');

        try {
            sceneInstance = await createScene(definition);
            const success = await sceneInstance.init();

            if (!success) {
                setViewportState(definition, 'error');
                sceneInstance = null;
                return;
            }

            setViewportState(definition, 'ready');
        } catch (err) {
            console.error('Failed to load Scene:', err);
            setViewportState(definition, 'error');
            sceneInstance = null;
        }
    }

    function cleanup() {
        if (sceneInstance) {
            if(typeof sceneInstance.destroy === 'function') sceneInstance.destroy();
            sceneInstance = null;
        }
        clearViewportState();
    }

    function checkPage() {
        const definition = getSceneDefinition();

        if (!definition) {
            if (sceneInstance) {
                cleanup();
            }
            currentSceneSlug = null;
            return;
        }

        if (definition.slug !== currentSceneSlug) {
            if (sceneInstance) {
                cleanup();
            }
            currentSceneSlug = definition.slug;
            initScene();
        } else if (!sceneInstance) {
            initScene();
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
            // Delay to let MkDocs finish DOM swap
            setTimeout(checkPage, 150);
        }
    }, 100);

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        setTimeout(checkPage, 50);
    });

})();
