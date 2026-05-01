/**
 * Canvas Scene Entry Point
 *
 * Lightweight bootstrap that handles page detection and lifecycle
 * for the Canvas scenes. Works with MkDocs instant navigation.
 */

(function () {
    'use strict';

    let sceneInstance = null;

    function normalizePath(pathname) {
        return pathname.endsWith('index.html') ? pathname.slice(0, -'index.html'.length) : pathname;
    }

    function getSceneType() {
        const path = normalizePath(window.location.pathname);
        if (path.includes('/canvas/zen-geometry/')) return 'zen-geometry';
        if (path.includes('/canvas/crystal-cave/')) return 'crystal-cave';
        if (path.includes('/canvas/particle-flow/')) return 'particle-flow';
        if (path.includes('/canvas/quantum-lattice/')) return 'quantum-lattice';
        if (path.includes('/canvas/neon-geode/')) return 'neon-geode';
        if (path.includes('/canvas/magnetic-dust/')) return 'magnetic-dust';
        if (path.includes('/canvas/origami-unfolding/')) return 'origami-unfolding';
        if (path.includes('/canvas/glacial-caverns/')) return 'glacial-caverns';
        if (path.includes('/canvas/solar-flare/')) return 'solar-flare';
        if (path.includes('/canvas/string-theory/')) return 'string-theory';
        if (path.includes('/canvas/bismuth-fracture/')) return 'bismuth-fracture';
        if (path.includes('/canvas/digital-rain/')) return 'digital-rain';
        if (path.includes('/canvas/echo-chains/')) return 'echo-chains';
        if (path.includes('/canvas/obsidian-shards/')) return 'obsidian-shards';
        if (path.includes('/canvas/smoke-mirrors/')) return 'smoke-mirrors';
        if (path.includes('/canvas/the-loom/')) return 'the-loom';
        if (path.includes('/canvas/radioactive-slag/')) return 'radioactive-slag';
        if (path.includes('/canvas/tidal-pool/')) return 'tidal-pool';
        if (path.includes('/canvas/synaptic-flash/')) return 'synaptic-flash';
        if (path.includes('/canvas/holographic-sand/')) return 'holographic-sand';
        return null;
    }

    async function initScene() {
        const sceneType = getSceneType();
        if (!sceneType) return;
        if (sceneInstance) return;

        try {
            if (sceneType === 'zen-geometry') { const { ZenGeometryScene } = await import('./ZenGeometryScene.js'); sceneInstance = new ZenGeometryScene(); }
            else if (sceneType === 'crystal-cave') { const { CrystalCaveScene } = await import('./CrystalCaveScene.js'); sceneInstance = new CrystalCaveScene(); }
            else if (sceneType === 'particle-flow') { try { const { ParticleFlowScene } = await import('./ParticleFlowScene.js'); sceneInstance = new ParticleFlowScene(); } catch { return; } }
            else if (sceneType === 'quantum-lattice') { const { QuantumLatticeScene } = await import('./QuantumLatticeScene.js'); sceneInstance = new QuantumLatticeScene(); }
            else if (sceneType === 'neon-geode') { const { NeonGeodeScene } = await import('./NeonGeodeScene.js'); sceneInstance = new NeonGeodeScene(); }
            else if (sceneType === 'magnetic-dust') { const { MagneticDustScene } = await import('./MagneticDustScene.js'); sceneInstance = new MagneticDustScene(); }
            else if (sceneType === 'origami-unfolding') { const { OrigamiUnfoldingScene } = await import('./OrigamiUnfoldingScene.js'); sceneInstance = new OrigamiUnfoldingScene(); }
            else if (sceneType === 'glacial-caverns') { const { GlacialCavernsScene } = await import('./GlacialCavernsScene.js'); sceneInstance = new GlacialCavernsScene(); }
            else if (sceneType === 'solar-flare') { const { SolarFlareScene } = await import('./SolarFlareScene.js'); sceneInstance = new SolarFlareScene(); }
            else if (sceneType === 'string-theory') { const { StringTheoryScene } = await import('./StringTheoryScene.js'); sceneInstance = new StringTheoryScene(); }
            else if (sceneType === 'bismuth-fracture') { const { BismuthFractureScene } = await import('./BismuthFractureScene.js'); sceneInstance = new BismuthFractureScene(); }
            else if (sceneType === 'digital-rain') { const { DigitalRainScene } = await import('./DigitalRainScene.js'); sceneInstance = new DigitalRainScene(); }
            else if (sceneType === 'echo-chains') { const { EchoChainsScene } = await import('./EchoChainsScene.js'); sceneInstance = new EchoChainsScene(); }
            else if (sceneType === 'obsidian-shards') { const { ObsidianShardsScene } = await import('./ObsidianShardsScene.js'); sceneInstance = new ObsidianShardsScene(); }
            else if (sceneType === 'smoke-mirrors') { const { SmokeMirrorsScene } = await import('./SmokeMirrorsScene.js'); sceneInstance = new SmokeMirrorsScene(); }
            else if (sceneType === 'the-loom') { const { TheLoomScene } = await import('./TheLoomScene.js'); sceneInstance = new TheLoomScene(); }
            else if (sceneType === 'radioactive-slag') { const { RadioactiveSlagScene } = await import('./RadioactiveSlagScene.js'); sceneInstance = new RadioactiveSlagScene(); }
            else if (sceneType === 'tidal-pool') { const { TidalPoolScene } = await import('./TidalPoolScene.js'); sceneInstance = new TidalPoolScene(); }
            else if (sceneType === 'synaptic-flash') { const { SynapticFlashScene } = await import('./SynapticFlashScene.js'); sceneInstance = new SynapticFlashScene(); }
            else if (sceneType === 'holographic-sand') { const { HolographicSandScene } = await import('./HolographicSandScene.js'); sceneInstance = new HolographicSandScene(); }

            const success = await sceneInstance.init();

            if (!success) {
                sceneInstance = null;
            }
        } catch (err) {
            console.error('Failed to load Scene:', err);
            sceneInstance = null;
        }
    }

    function cleanup() {
        if (sceneInstance) {
            if(typeof sceneInstance.destroy === 'function') sceneInstance.destroy();
            sceneInstance = null;
        }
    }

    function checkPage() {
        if (getSceneType()) {
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
