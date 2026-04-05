/**
 * Crystal Cave Scene - Main Orchestrator
 * 
 * Coordinates all scene components: crystals, particles, lighting,
 * camera, and interactions. Manages lifecycle and theme changes.
 */
import * as THREE from 'three';
import { getThemeColors, getCurrentTheme, themes } from './themes/ThemeConfig.js';
import { createCrystals } from './crystals/CrystalFactory.js';
import { ParticleSystem } from './particles/ParticleSystem.js';
import { LightingSystem } from './lighting/LightingSystem.js';
import { OrbitCamera } from './camera/OrbitCamera.js';
import { InteractionManager } from './interaction/InteractionManager.js';
import { CrystalAnimator } from './animation/CrystalAnimator.js';
import { ThemeTransition } from './themes/ThemeTransition.js';

export class CrystalCaveScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.clock = { start: 0 };

        // Domain components
        this.orbitCamera = null;
        this.crystalGroup = null;
        this.crystals = [];
        this.materials = [];
        this.particleSystem = null;
        this.lightingSystem = null;
        this.interactionManager = null;
        this.crystalAnimator = null;
        this.themeTransition = null;
        this.themeObserver = null;

        // Bound handlers
        this._handleResize = this._onResize.bind(this);
        this._positionCanvas = this._updateCanvasPosition.bind(this);
    }

    /**
     * Initialize the scene
     */
    async init() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = this.containerId;
        document.body.appendChild(this.container);

        this._updateCanvasPosition();
        window.addEventListener('resize', this._positionCanvas);
        window.addEventListener('scroll', this._positionCanvas);

        try {
            await this._setupScene();
            await this._createComponents();
            this._setupThemeObserver();
            this._startRenderLoop();
            return true;
        } catch (err) {
            console.error('Failed to initialize Crystal Cave Scene:', err);
            this.destroy();
            return false;
        }
    }

    /**
     * Position canvas between header and footer
     */
    _updateCanvasPosition() {
        const header = document.querySelector('.md-header');
        const footer = document.querySelector('.md-footer');

        const headerHeight = header ? header.offsetHeight : 0;
        let footerTop = window.innerHeight;

        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            if (footerRect.top < window.innerHeight && footerRect.top > headerHeight) {
                footerTop = footerRect.top;
            }
        }

        const canvasHeight = footerTop - headerHeight;
        this.container.style.top = headerHeight + 'px';
        this.container.style.height = canvasHeight + 'px';
    }

    /**
     * Setup Three.js scene, camera, and renderer
     */
    async _setupScene() {
        const colors = getThemeColors();

        // Scene with fog
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.Fog(colors.fogColor, colors.fogNear, colors.fogFar);

        // Camera
        this.orbitCamera = new OrbitCamera({ radius: 10 });
        this.orbitCamera.create(this.container.clientWidth / this.container.clientHeight);

        // Detect mobile for performance optimization
        const isMobile = this.orbitCamera.isMobile;
        const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: !isMobile, // Disable antialiasing on mobile for performance
            alpha: false,
            powerPreference: isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = colors.toneMappingExposure;
        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * Create all scene components
     */
    async _createComponents() {
        const colors = getThemeColors();

        // Crystal group
        this.crystalGroup = new THREE.Group();
        this.scene.add(this.crystalGroup);

        const { crystals, materials } = createCrystals(this.crystalGroup, colors.crystalColors);
        this.crystals = crystals;
        this.materials = materials;

        // Detect mobile for performance adjustments
        const isMobile = this.orbitCamera.isMobile;

        // Particles - reduced count on mobile
        this.particleSystem = new ParticleSystem({
            count: isMobile ? 500 : 1000,
            color: colors.particleColor,
            size: isMobile ? colors.particleSize * 1.2 : colors.particleSize, // Slightly larger on mobile to compensate
            opacity: colors.particleOpacity,
        });
        this.scene.add(this.particleSystem.create());

        // Lighting
        this.lightingSystem = new LightingSystem();
        this.lightingSystem.create(this.scene, colors);

        // Interactions
        this.interactionManager = new InteractionManager(
            this.container,
            this.orbitCamera.camera,
            this.crystals,
            this.orbitCamera
        );
        this.interactionManager.attach();

        // Show touch hint on mobile
        if (this.interactionManager.getIsMobile()) {
            this._showTouchHint();
        }

        // Crystal animation
        this.crystalAnimator = new CrystalAnimator(
            this.crystals,
            this.materials,
            colors.glowColor
        );

        // Theme transitions
        this.themeTransition = new ThemeTransition({
            scene: this.scene,
            renderer: this.renderer,
            materials: this.materials,
            particleSystem: this.particleSystem,
            lightingSystem: this.lightingSystem,
            crystalAnimator: this.crystalAnimator,
        });

        // Resize handler
        window.addEventListener('resize', this._handleResize);
    }

    /**
     * Setup theme change observer
     */
    _setupThemeObserver() {
        let currentTheme = getCurrentTheme();

        this.themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-md-color-scheme') {
                    const newTheme = getCurrentTheme();
                    if (newTheme !== currentTheme) {
                        const fromColors = themes[currentTheme];
                        const toColors = themes[newTheme];
                        this.themeTransition.transition(fromColors, toColors);
                        currentTheme = newTheme;
                    }
                }
            });
        });

        this.themeObserver.observe(document.body, { attributes: true });
    }

    /**
     * Handle window resize
     */
    _onResize() {
        this._updateCanvasPosition();
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.orbitCamera.resize(width, height);
        this.renderer.setSize(width, height);
    }

    /**
     * Start the render loop
     */
    _startRenderLoop() {
        this.clock.start = performance.now();

        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = (performance.now() - this.clock.start) / 1000;

            // Update camera
            this.orbitCamera.update(elapsed);

            // Update crystals
            this.crystalAnimator.update(
                elapsed,
                (crystal) => this.interactionManager.isCrystalActive(crystal)
            );

            // Update particles with mouse attraction
            this.particleSystem.update(this.interactionManager.getMouse3D());

            // Update lighting shimmer
            this.lightingSystem.update(elapsed);

            // Render
            this.renderer.render(this.scene, this.orbitCamera.camera);
        };

        animate();
    }

    /**
     * Show touch hint overlay for mobile users
     */
    _showTouchHint() {
        // Check if already shown this session
        if (sessionStorage.getItem('canvas-touch-hint-shown')) {
            return;
        }

        const hint = document.createElement('div');
        hint.className = 'canvas-touch-hint';
        hint.innerHTML = `
            <span class="canvas-touch-hint__icon">&#128072;</span>
            <span class="canvas-touch-hint__text">
                Drag to orbit<br>
                Pinch to zoom<br>
                Tap crystal to focus
            </span>
        `;
        this.container.appendChild(hint);

        // Show after a brief delay
        setTimeout(() => {
            hint.classList.add('is-visible');
        }, 500);

        // Hide after 4 seconds
        setTimeout(() => {
            hint.classList.remove('is-visible');
            sessionStorage.setItem('canvas-touch-hint-shown', 'true');
        }, 4500);

        // Hide on first touch
        const hideOnTouch = () => {
            hint.classList.remove('is-visible');
            sessionStorage.setItem('canvas-touch-hint-shown', 'true');
            this.container.removeEventListener('touchstart', hideOnTouch);
        };
        this.container.addEventListener('touchstart', hideOnTouch, { once: true });
    }

    /**
     * Clean up and destroy the scene
     */
    destroy() {
        this.isDestroyed = true;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        window.removeEventListener('resize', this._handleResize);
        window.removeEventListener('resize', this._positionCanvas);
        window.removeEventListener('scroll', this._positionCanvas);

        if (this.interactionManager) {
            this.interactionManager.detach();
        }

        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.particleSystem) {
            this.particleSystem.dispose();
        }

        // Dispose crystals
        this.crystals.forEach(crystal => {
            if (crystal.geometry) crystal.geometry.dispose();
        });
        this.materials.forEach(mat => mat.dispose());

        // Remove container
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
