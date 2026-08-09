/**
 * ImmersiveScene - restrained layered background
 */
import * as THREE from 'three';
import { DeviceDetector } from '../utils/DeviceDetector.js';
import { GradientBackground } from '../effects/GradientBackground.js';
import { FlowingWaves } from '../effects/FlowingWaves.js';
import { InteractiveParticles } from '../effects/InteractiveParticles.js';
import { AuroraVeil } from '../effects/AuroraVeil.js';

export class ImmersiveScene {
    constructor(containerId = 'threejs-bg-container') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.clock = new THREE.Clock();

        // Device detection for responsive behavior
        this.deviceDetector = new DeviceDetector();
        this.deviceType = this.deviceDetector.getDeviceType();

        // Mouse tracking
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        // Effect systems
        this.gradientBackground = null;
        this.flowingWaves = null;
        this.interactiveParticles = null;
        this.auroraVeil = null;

        this.themes = {
            dark: {
                gradientTop: 0x121211,
                gradientBottom: 0x090909,
                accent: 0x30302e,
                particlePrimary: 0x8d8c86,
                particleSecondary: 0xd4d2cc,
                waveColor: 0x40403d,
                waveOpacity: 0.08,
                auroraColor: 0x323230,
            },
            light: {
                gradientTop: 0xf6f5f0,
                gradientBottom: 0xe8e6df,
                accent: 0xc8c5bc,
                particlePrimary: 0x70706b,
                particleSecondary: 0x1f1f1f,
                waveColor: 0x8b8a84,
                waveOpacity: 0.06,
                auroraColor: 0xd5d2ca,
            }
        };

        this.currentTheme = 'dark';
    }

    async init() {
        try {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                return false;
            }

            await this.setupScene();
            await this.setupCamera();
            await this.setupRenderer();
            await this.createEffects();
            this.detectTheme();
            this.attachEventListeners();
            this.startRenderLoop();

            return true;
        } catch {
            return false;
        }
    }

    async setupScene() {
        this.scene = new THREE.Scene();
    }

    async setupCamera() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.z = 50;
    }

    async setupRenderer() {
        // Device-appropriate quality settings
        const antialias = this.deviceType !== 'mobile';
        const pixelRatio = this.deviceDetector.getOptimalPixelRatio();

        this.renderer = new THREE.WebGLRenderer({
            antialias: antialias,
            alpha: true,
            powerPreference: this.deviceType === 'mobile' ? 'low-power' : 'default'
        });

        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);

        this.container.appendChild(this.renderer.domElement);
    }

    async createEffects() {
        const theme = this.themes[this.currentTheme];
        const responsive = this.getResponsiveSettings();

        // 1. Gradient Background (renders first, behind everything)
        this.gradientBackground = new GradientBackground({
            colorTop: new THREE.Color(theme.gradientTop),
            colorBottom: new THREE.Color(theme.gradientBottom),
            colorAccent: new THREE.Color(theme.accent),
            waveIntensity: responsive.waveIntensity,
        });
        // Note: gradient is rendered separately as screen-space quad

        // 1.5 Aurora Veils (between gradient and waves)
        if (responsive.enableAurora) {
            this.auroraVeil = new AuroraVeil({
                veilCount: responsive.auroraCount,
                color: theme.auroraColor,
                opacity: responsive.auroraOpacity,
                height: responsive.auroraHeight,
                width: responsive.auroraWidth,
                speed: responsive.auroraSpeed,
                parallaxStrength: responsive.auroraParallax,
            });
            this.scene.add(this.auroraVeil.create());
        }

        // 2. Flowing Waves (mid-layer)
        this.flowingWaves = new FlowingWaves({
            waveCount: responsive.waveCount,
            color: theme.waveColor,
            opacity: theme.waveOpacity,
            amplitude: responsive.waveAmplitude,
            speed: 0.4,
            width: responsive.waveWidth,
            height: responsive.waveHeight,
        });
        this.scene.add(this.flowingWaves.create());

        // 3. Interactive Particles (foreground)
        this.interactiveParticles = new InteractiveParticles({
            particleCount: responsive.particleCount,
            particleSize: responsive.particleSize,
            connectionDistance: responsive.connectionDistance,
            mouseRadius: responsive.mouseRadius,
            colorPrimary: theme.particlePrimary,
            colorSecondary: theme.particleSecondary,
            spread: responsive.particleSpread,
        });
        this.scene.add(this.interactiveParticles.create());
    }

    /**
     * Get responsive settings based on device type and screen size
     * Optimized for subtle, non-distracting backgrounds
     */
    getResponsiveSettings() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = width / height;

        if (this.deviceType === 'mobile' || width < 768) {
            return {
                particleCount: 24,
                particleSize: 2.2,
                connectionDistance: 8,
                mouseRadius: 16,
                particleSpread: { x: 50, y: 35, z: 25 },
                waveCount: 1,
                waveWidth: 80,
                waveHeight: 12,
                waveAmplitude: 0.6,
                waveIntensity: 0.03,
                cameraMovement: 1.4,
                enableAurora: false,
                auroraCount: 0,
                auroraOpacity: 0,
                auroraWidth: 60,
                auroraHeight: 100,
                auroraSpeed: 0.08,
                auroraParallax: 0.8,
            };
        }

        if (this.deviceType === 'tablet' || width < 1024) {
            return {
                particleCount: 60,
                particleSize: 2.6,
                connectionDistance: 12,
                mouseRadius: 22,
                particleSpread: { x: 90, y: 60, z: 40 },
                waveCount: 1,
                waveWidth: 120,
                waveHeight: 18,
                waveAmplitude: 1.0,
                waveIntensity: 0.06,
                cameraMovement: 2.4,
                enableAurora: true,
                auroraCount: 1,
                auroraOpacity: 0.05,
                auroraWidth: 88,
                auroraHeight: 120,
                auroraSpeed: 0.1,
                auroraParallax: 1.1,
            };
        }

        const spreadX = Math.min(140, 100 + (aspectRatio * 20));
        const waveWidth = Math.min(190, 145 + (aspectRatio * 18));

        return {
            particleCount: 96,
            particleSize: 2.8,
            connectionDistance: 14,
            mouseRadius: 24,
            particleSpread: { x: spreadX, y: 80, z: 50 },
            waveCount: 2,
            waveWidth: waveWidth,
            waveHeight: 22,
            waveAmplitude: 1.4,
            waveIntensity: 0.08,
            cameraMovement: 3.2,
            enableAurora: true,
            auroraCount: 1,
            auroraOpacity: 0.06,
            auroraWidth: waveWidth * 0.45,
            auroraHeight: 132,
            auroraSpeed: 0.11,
            auroraParallax: 1.3,
        };
    }

    detectTheme() {
        let isDarkMode = false;
        const scheme = document.body?.getAttribute('data-md-color-scheme');

        if (scheme) {
            isDarkMode = scheme === 'slate';
        } else {
            // Initial load fallback before MkDocs hydration
            try {
                const paletteObj = JSON.parse(localStorage.getItem('__md_param') || '{}').palette;
                if (paletteObj && paletteObj.color && paletteObj.color.scheme) {
                    isDarkMode = paletteObj.color.scheme === 'slate';
                } else {
                    isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
            } catch (e) {
                isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
        }
        
        this.currentTheme = isDarkMode ? 'dark' : 'light';
        this.applyTheme();
    }

    applyTheme() {
        const theme = this.themes[this.currentTheme];
        const responsive = this.getResponsiveSettings();

        if (this.gradientBackground) {
            this.gradientBackground.setColors(
                theme.gradientTop,
                theme.gradientBottom,
                theme.accent
            );
        }

        if (this.auroraVeil) {
            this.auroraVeil.setColor(theme.auroraColor);
            this.auroraVeil.setOpacity(responsive.auroraOpacity);
        }

        if (this.flowingWaves) {
            this.flowingWaves.setColor(theme.waveColor);
            this.flowingWaves.setOpacity(theme.waveOpacity);
        }

        if (this.interactiveParticles) {
            this.interactiveParticles.setColors(
                theme.particlePrimary,
                theme.particleSecondary
            );
        }
    }

    attachEventListeners() {
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleThemeChange = this.handleThemeChange.bind(this);

        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('mousemove', this.handleMouseMove, { passive: true });

        // Theme observer - watch body where Material sets data-md-color-scheme
        if (document.body) {
            this.themeObserver = new MutationObserver(this.handleThemeChange);
            this.themeObserver.observe(document.body, {
                attributes: true,
                attributeFilter: ['data-md-color-scheme']
            });
        }
    }

    detachEventListeners() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);

        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
    }

    handleResize() {
        if (this.isDestroyed) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        // Recalculate device type on resize (handles orientation changes)
        this.deviceDetector.cache = {}; // Clear cache to redetect
        this.deviceType = this.deviceDetector.getDeviceType();
    }

    handleMouseMove(event) {
        // Normalize to -1 to 1
        this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    handleThemeChange() {
        this.detectTheme();
    }

    startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;

            this.animationId = requestAnimationFrame(animate);

            const elapsedTime = this.clock.getElapsedTime();
            const responsive = this.getResponsiveSettings();

            // Smooth mouse following
            this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
            this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

            // Update camera position based on mouse (responsive movement)
            const cameraMove = responsive.cameraMovement;
            this.camera.position.x = this.mouse.x * cameraMove;
            this.camera.position.y = this.mouse.y * (cameraMove * 0.625);
            this.camera.lookAt(0, 0, 0);

            // Update effects
            if (this.gradientBackground) {
                this.gradientBackground.update(elapsedTime);
            }

            if (this.auroraVeil) {
                this.auroraVeil.update(elapsedTime, this.mouse);
            }

            if (this.flowingWaves) {
                this.flowingWaves.update(elapsedTime);
            }

            if (this.interactiveParticles) {
                this.interactiveParticles.updateMouse(this.mouse.x, this.mouse.y);
                this.interactiveParticles.update(elapsedTime);
            }

            // Render gradient as background pass
            if (this.gradientBackground && this.gradientBackground.mesh) {
                // Render gradient first (screen-space, no depth)
                const gradientScene = new THREE.Scene();
                gradientScene.add(this.gradientBackground.mesh);

                const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
                this.renderer.render(gradientScene, orthoCamera);

                gradientScene.remove(this.gradientBackground.mesh);
            }

            // Render main scene with transparency over gradient
            this.renderer.autoClear = false;
            this.renderer.render(this.scene, this.camera);
            this.renderer.autoClear = true;
        };

        animate();
    }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.detachEventListeners();

        // Dispose effects
        if (this.gradientBackground) {
            this.gradientBackground.dispose();
        }

        if (this.auroraVeil) {
            if (this.auroraVeil.group) {
                this.scene?.remove(this.auroraVeil.group);
            }
            this.auroraVeil.dispose();
        }

        if (this.flowingWaves) {
            this.flowingWaves.dispose();
        }

        if (this.interactiveParticles) {
            this.interactiveParticles.dispose();
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }
}
