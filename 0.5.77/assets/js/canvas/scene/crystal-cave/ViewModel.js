/**
 * Crystal Cave ViewModel - Core Behavioral Logic
 * 
 * Orchestrates all scene components: crystals, particles, lighting,
 * and interaction logic. This is the "brain" of the component.
 */
import * as THREE from 'three';
import { CRYSTAL_CAVE_CONFIG } from './Model.js';
import { OrbitCamera } from '../camera/OrbitCamera.js';
import { LightingSystem } from '../lighting/LightingSystem.js';
import { ParticleSystem } from '../particles/ParticleSystem.js';
import { createCrystals } from '../crystals/CrystalFactory.js';
import { CrystalAnimator } from '../animation/CrystalAnimator.js';
import { ThemeTransition } from '../themes/ThemeTransition.js';
import { InteractionManager } from '../interaction/InteractionManager.js';
import { getCurrentTheme, themes } from '../themes/ThemeConfig.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = CRYSTAL_CAVE_CONFIG;
        this.isMobile = isMobile;

        // Functional systems (Behavioral Logic)
        this.orbitCamera = null;
        this.lightingSystem = null;
        this.particleSystem = null;
        this.crystalAnimator = null;
        this.themeTransition = null;
        this.interactionManager = null;
        this.themeObserver = null;

        this.currentTheme = getCurrentTheme();
        this.startTime = performance.now();
        
        this.crystals = [];
        this.materials = [];
    }

    init(colors) {
        const perf = this.isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        // 1. Initialize View stage
        this.view.init(colors, perf);

        // 2. Initialize Orbit Camera logic
        this.orbitCamera = new OrbitCamera({ radius: this.config.defaultRadius });
        this.orbitCamera.create(this.view.container.clientWidth / this.view.container.clientHeight);
        // Sync View camera with Logical camera
        this.view.camera = this.orbitCamera.camera;

        // 3. Initialize Components
        this._createComponents(colors, perf);

        // 4. Initialize Interaction
        this.interactionManager = new InteractionManager(
            this.view.container,
            this.view.camera,
            this.crystals,
            this.orbitCamera
        );
        this.interactionManager.attach();

        this._setupThemeObserver();
    }

    _createComponents(colors, perf) {
        const crystalGroup = new THREE.Group();
        const { crystals, materials } = createCrystals(crystalGroup, colors.crystalColors);
        this.crystals = crystals;
        this.materials = materials;
        this.view.addToScene(crystalGroup);

        this.particleSystem = new ParticleSystem({
            count: perf.particleCount,
            color: colors.particleColor,
            size: this.isMobile ? colors.particleSize * 1.2 : colors.particleSize,
            opacity: colors.particleOpacity,
        });
        this.view.addToScene(this.particleSystem.create());

        this.lightingSystem = new LightingSystem();
        this.lightingSystem.create(this.view.scene, colors);

        this.crystalAnimator = new CrystalAnimator(
            this.crystals,
            this.materials,
            colors.glowColor
        );

        this.themeTransition = new ThemeTransition({
            scene: this.view.scene,
            renderer: this.view.renderer,
            materials: this.materials,
            particleSystem: this.particleSystem,
            lightingSystem: this.lightingSystem,
            crystalAnimator: this.crystalAnimator,
        });
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;

        // Behavior: Camera movement
        this.orbitCamera.update(elapsed);
        
        // Behavior: Crystal shimmer and activation
        this.crystalAnimator.update(
            elapsed,
            (crystal) => this.interactionManager.isCrystalActive(crystal)
        );

        // Behavior: Particle flow and lighting pulses
        this.particleSystem.update(this.interactionManager.getMouse3D());
        this.lightingSystem.update(elapsed);
        
        this.view.render();
    }

    _setupThemeObserver() {
        this.themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-md-color-scheme') {
                    const newTheme = getCurrentTheme();
                    if (newTheme !== this.currentTheme) {
                        const fromColors = themes[this.currentTheme];
                        const toColors = themes[newTheme];
                        
                        // Behavior: Theme transition orchestration
                        this.view.scene.background.set(toColors.background);
                        this.view.scene.fog.color.set(toColors.fogColor);
                        this.themeTransition.transition(fromColors, toColors);
                        
                        this.currentTheme = newTheme;
                    }
                }
            });
        });

        this.themeObserver.observe(document.body, { attributes: true });
    }

    onResize() {
        const { clientWidth: w, clientHeight: h } = this.view.container;
        this.orbitCamera.resize(w, h);
        this.view.onResize();
    }

    dispose() {
        if (this.interactionManager) this.interactionManager.detach();
        if (this.themeObserver) this.themeObserver.disconnect();
        if (this.particleSystem) this.particleSystem.dispose();
        
        this.crystals.forEach(c => c.geometry && c.geometry.dispose());
        this.materials.forEach(m => m.dispose());
        
        this.view.dispose();
    }
}
