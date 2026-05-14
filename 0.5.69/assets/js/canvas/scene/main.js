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

    function getSceneIndex(definition) {
        return SCENE_REGISTRY.findIndex((scene) => scene.slug === definition.slug);
    }

    function getCanvasBasePath() {
        const path = normalizePath(window.location.pathname);
        const canvasIndex = path.indexOf('/canvas/');
        return canvasIndex > -1 ? path.slice(0, canvasIndex) : '';
    }

    function getSceneHref(scene) {
        return `${getCanvasBasePath()}${scene.path}`;
    }

    function getNeighborScene(definition, offset) {
        const index = getSceneIndex(definition);
        if (index < 0) return null;

        const nextIndex = (index + offset + SCENE_REGISTRY.length) % SCENE_REGISTRY.length;
        return SCENE_REGISTRY[nextIndex];
    }

    function createSequenceButton(targetScene, direction) {
        const link = document.createElement('a');
        const directionLabel = direction === 'prev' ? 'Previous' : 'Next';

        link.className = `canvas-sequence-button canvas-sequence-button--${direction}`;
        link.href = getSceneHref(targetScene);
        link.rel = direction;
        link.setAttribute('aria-label', `${directionLabel} canvas: ${targetScene.title}`);

        const kicker = document.createElement('span');
        kicker.className = 'canvas-sequence-button__kicker';
        kicker.textContent = directionLabel;

        const title = document.createElement('span');
        title.className = 'canvas-sequence-button__title';
        title.textContent = targetScene.title;

        link.append(kicker, title);
        return link;
    }

    function ensureSceneNavigation(definition) {
        const viewport = getViewport();
        if (!viewport) return;

        let stage = viewport.closest('.canvas-example-stage');
        if (!stage && viewport.parentElement) {
            stage = document.createElement('div');
            stage.className = 'canvas-example-stage';
            viewport.parentElement.insertBefore(stage, viewport);
            stage.appendChild(viewport);
        }
        if (!stage) return;

        let nav = stage.querySelector('.canvas-sequence-nav');
        if (!nav) {
            nav = document.createElement('nav');
            nav.className = 'canvas-sequence-nav';
            nav.setAttribute('aria-label', 'Canvas example navigation');
            stage.appendChild(nav);
        }

        const previous = getNeighborScene(definition, -1);
        const next = getNeighborScene(definition, 1);
        if (!previous || !next) return;

        nav.replaceChildren(
            createSequenceButton(previous, 'prev'),
            createSequenceButton(next, 'next')
        );
    }

    function clearSceneNavigation(viewport) {
        const stage = viewport.closest('.canvas-example-stage');
        const nav = stage ? stage.querySelector('.canvas-sequence-nav') : null;
        if (nav) nav.remove();
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
        ensureSceneNavigation(definition);
    }

    function clearViewportState() {
        const viewport = getViewport();
        if (!viewport) return;

        clearSceneNavigation(viewport);
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

    // Fullscreen toggle for canvas example pages
    const FS_ENTER_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M5 5h5v2H7v3H5V5m9 0h5v5h-2V7h-3V5m3 9v5h-5v-2h3v-3h2M5 15h2v3h3v2H5v-5Z" fill="currentColor"/></svg>';
    const FS_EXIT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M14 14h5v2h-3v3h-2v-5m-9 0h5v5H8v-3H5v-2m3-9v5H5V8h3V5h2m9 0v5h-2V7h-3V5h5Z" fill="currentColor"/></svg>';

    function updateFullscreenButton() {
        const btn = document.getElementById('canvas-fullscreen-toggle');
        const viewport = document.getElementById('canvas-scene');
        if (!btn || !viewport) return;
        const isFs = viewport.classList.contains('is-fullscreen');
        btn.innerHTML = isFs ? FS_EXIT_ICON : FS_ENTER_ICON;
        btn.setAttribute('data-fullscreen', String(isFs));
        btn.setAttribute('title', isFs ? 'Exit fullscreen' : 'Toggle fullscreen');
        btn.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Toggle fullscreen');
    }

    function exitFullscreenViewport() {
        const viewport = document.getElementById('canvas-scene');
        if (!viewport) return;
        if (viewport.classList.contains('is-fullscreen')) {
            viewport.classList.remove('is-fullscreen');
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
            updateFullscreenButton();
        }
    }

    // Event delegation so the button works across MkDocs instant-navigation DOM swaps
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('#canvas-fullscreen-toggle');
        if (!btn) return;
        const viewport = document.getElementById('canvas-scene');
        if (!viewport) return;
        if (viewport.classList.contains('is-fullscreen')) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
            viewport.classList.remove('is-fullscreen');
        } else {
            viewport.classList.add('is-fullscreen');
            if (viewport.requestFullscreen) {
                viewport.requestFullscreen().catch(() => {});
            }
        }
        updateFullscreenButton();
    });

    document.addEventListener('fullscreenchange', () => {
        const viewport = document.getElementById('canvas-scene');
        if (!viewport) return;
        if (!document.fullscreenElement && viewport.classList.contains('is-fullscreen')) {
            viewport.classList.remove('is-fullscreen');
            updateFullscreenButton();
        }
    });

    // Wire up button icon on initial load and whenever the URL changes
    function setupFullscreenToggle() {
        updateFullscreenButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupFullscreenToggle);
    } else {
        setupFullscreenToggle();
    }

    // Track URL changes for instant navigation: exit fullscreen when leaving a canvas page
    let _fsLastPathname = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== _fsLastPathname) {
            _fsLastPathname = window.location.pathname;
            setTimeout(() => {
                exitFullscreenViewport();
                setupFullscreenToggle();
            }, 160);
        }
    }, 100);

})();
