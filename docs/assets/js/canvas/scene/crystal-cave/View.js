/**
 * Crystal Cave View - Three.js Rendering
 */
import * as THREE from 'three';
import { OrbitCamera } from '../camera/OrbitCamera.js';
import { LightingSystem } from '../lighting/LightingSystem.js';
import { ParticleSystem } from '../particles/ParticleSystem.js';
import { createCrystals } from '../crystals/CrystalFactory.js';
import { CrystalAnimator } from '../animation/CrystalAnimator.js';
import { ThemeTransition } from '../themes/ThemeTransition.js';

export class View {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.scene = null;
        this.renderer = null;
        this.orbitCamera = null;
        this.lightingSystem = null;
        this.particleSystem = null;
        this.crystalAnimator = null;
        this.themeTransition = null;
        
        this.crystals = [];
        this.materials = [];
    }

    init(colors) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fogColor, colors.fogNear, colors.fogFar);

        this.orbitCamera = new OrbitCamera({ radius: this.config.defaultRadius });
        this.orbitCamera.create(this.container.clientWidth / this.container.clientHeight);

        const isMobile = this.orbitCamera.isMobile;
        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;

        this.renderer = new THREE.WebGLRenderer({
            antialias: perf.antialias,
            alpha: false,
            powerPreference: perf.powerPreference
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(perf.pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = colors.toneMappingExposure;
        this.container.appendChild(this.renderer.domElement);

        this._createComponents(colors, isMobile);
    }

    _createComponents(colors, isMobile) {
        const crystalGroup = new THREE.Group();
        this.scene.add(crystalGroup);

        const { crystals, materials } = createCrystals(crystalGroup, colors.crystalColors);
        this.crystals = crystals;
        this.materials = materials;

        const perf = isMobile ? this.config.performance.mobile : this.config.performance.desktop;
        
        this.particleSystem = new ParticleSystem({
            count: perf.particleCount,
            color: colors.particleColor,
            size: isMobile ? colors.particleSize * 1.2 : colors.particleSize,
            opacity: colors.particleOpacity,
        });
        this.scene.add(this.particleSystem.create());

        this.lightingSystem = new LightingSystem();
        this.lightingSystem.create(this.scene, colors);

        this.crystalAnimator = new CrystalAnimator(
            this.crystals,
            this.materials,
            colors.glowColor
        );

        this.themeTransition = new ThemeTransition({
            scene: this.scene,
            renderer: this.renderer,
            materials: this.materials,
            particleSystem: this.particleSystem,
            lightingSystem: this.lightingSystem,
            crystalAnimator: this.crystalAnimator,
        });
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.orbitCamera.resize(width, height);
        this.renderer.setSize(width, height);
    }

    render(elapsed, viewModel) {
        this.orbitCamera.update(elapsed);
        
        this.crystalAnimator.update(
            elapsed,
            (crystal) => viewModel.interactionManager.isCrystalActive(crystal)
        );

        this.particleSystem.update(viewModel.interactionManager.getMouse3D());
        this.lightingSystem.update(elapsed);
        
        this.renderer.render(this.scene, this.orbitCamera.camera);
    }

    transitionTheme(fromColors, toColors) {
        if (this.themeTransition) {
            this.themeTransition.transition(fromColors, toColors);
        }
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
        if (this.particleSystem) this.particleSystem.dispose();
        this.crystals.forEach(c => c.geometry && c.geometry.dispose());
        this.materials.forEach(m => m.dispose());
    }
}
