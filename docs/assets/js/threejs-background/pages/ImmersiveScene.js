/**
 * ImmersiveScene - Bruno Simon-inspired full experience
 * 
 * Combines multiple visual effects into a cohesive, immersive background:
 * - Animated gradient background for depth
 * - Flowing wave geometry for organic movement
 * - Interactive particles with constellation connections
 * - Mouse-responsive camera and effects
 * 
 * Architecture: Vertical Slice (page-specific implementation)
 * Pattern: Facade (combines multiple effect systems)
 */
import * as THREE from 'three';
import { DeviceDetector } from '../utils/DeviceDetector.js';
import { GradientBackground } from '../effects/GradientBackground.js';
import { FlowingWaves } from '../effects/FlowingWaves.js';
import { InteractiveParticles } from '../effects/InteractiveParticles.js';

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

        // Theme colors
        this.themes = {
            dark: {
                gradientTop: 0x1a1a2e,
                gradientBottom: 0x0f0f1a,
                accent: 0x26A69A,
                particlePrimary: 0x26A69A,
                particleSecondary: 0xFF8A65,
                waveColor: 0x26A69A,
                waveOpacity: 0.25,
            },
            light: {
                gradientTop: 0xf5f5f5,
                gradientBottom: 0xe8e8e8,
                accent: 0x009688,
                particlePrimary: 0x009688,
                particleSecondary: 0xFF7043,
                waveColor: 0x009688,
                waveOpacity: 0.15,
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
     */
    getResponsiveSettings() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = width / height;

        // Base settings adjusted by device type
        if (this.deviceType === 'mobile' || width < 768) {
            return {
                particleCount: 60,
                particleSize: 3,
                connectionDistance: 12,
                mouseRadius: 25,
                particleSpread: { x: 60, y: 40, z: 30 },
                waveCount: 2,
                waveWidth: 100,
                waveHeight: 20,
                waveAmplitude: 1.5,
                waveIntensity: 0.1,
                cameraMovement: 3,
            };
        }

        if (this.deviceType === 'tablet' || width < 1024) {
            return {
                particleCount: 100,
                particleSize: 3.5,
                connectionDistance: 15,
                mouseRadius: 30,
                particleSpread: { x: 100, y: 70, z: 45 },
                waveCount: 2,
                waveWidth: 150,
                waveHeight: 25,
                waveAmplitude: 2.0,
                waveIntensity: 0.12,
                cameraMovement: 5,
            };
        }

        // Desktop - full experience
        // Adjust spread based on aspect ratio for ultrawide monitors
        const spreadX = Math.min(140, 100 + (aspectRatio * 20));
        const waveWidth = Math.min(250, 180 + (aspectRatio * 20));

        return {
            particleCount: 180,
            particleSize: 4,
            connectionDistance: 18,
            mouseRadius: 35,
            particleSpread: { x: spreadX, y: 90, z: 60 },
            waveCount: 3,
            waveWidth: waveWidth,
            waveHeight: 30,
            waveAmplitude: 2.5,
            waveIntensity: 0.15,
            cameraMovement: 8,
        };
    }

    detectTheme() {
        const isDarkMode = document.documentElement.getAttribute('data-md-color-scheme') === 'slate';
        this.currentTheme = isDarkMode ? 'dark' : 'light';
        this.applyTheme();
    }

    applyTheme() {
        const theme = this.themes[this.currentTheme];

        if (this.gradientBackground) {
            this.gradientBackground.setColors(
                theme.gradientTop,
                theme.gradientBottom,
                theme.accent
            );
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

        // Theme observer - only if document element exists
        if (document.documentElement) {
            this.themeObserver = new MutationObserver(this.handleThemeChange);
            this.themeObserver.observe(document.documentElement, {
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
