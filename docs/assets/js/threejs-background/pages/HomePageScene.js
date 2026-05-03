/**
 * HomePageScene - Loom-inspired Three.js background for the landing page.
 */
import * as THREE from 'three';
import { SceneManager } from '../core/SceneManager.js';
import { DeviceDetector } from '../utils/DeviceDetector.js';
import { LoomField } from '../../canvas/scene/loom/LoomField.js';

export class HomePageScene {
    constructor(containerId = 'threejs-bg-container') {
        this.containerId = containerId;
        this.sceneManager = null;
        this.deviceDetector = new DeviceDetector();
        this.loomField = null;
        this.loomGroup = null;
        this.pointer = new THREE.Vector2(1000, 1000);
        this.pointerWorld = new THREE.Vector3(1000, 1000, 0);
        this.lastPointerMove = 0;
        this.themeObserver = null;

        this._handlePointerMove = this._onPointerMove.bind(this);
        this._handleTouchMove = this._onTouchMove.bind(this);
    }

    async init() {
        const qualitySettings = this.deviceDetector.getQualitySettings();
        this.sceneManager = new SceneManager(this.containerId, {
            antialias: qualitySettings.antialias,
            pixelRatio: this.deviceDetector.getOptimalPixelRatio(),
            powerPreference: this.deviceDetector.isMobile() ? 'low-power' : 'high-performance',
        });
        const success = await this.sceneManager.init();

        if (!success) {
            return false;
        }

        this.setupCamera();
        this.createLoom();
        this.setupInteraction();
        this.setupThemeObserver();
        this.setupUpdateLoop();

        this.sceneManager.startRenderLoop();

        return true;
    }

    setupCamera() {
        this.sceneManager.camera.position.set(0, 0, this.deviceDetector.isMobile() ? 22 : 24);
        this.sceneManager.camera.lookAt(0, 0, 0);
    }

    createLoom() {
        const colors = this.getColors();
        const isMobile = this.deviceDetector.isMobile();
        const isTablet = this.deviceDetector.isTablet();

        this.loomField = new LoomField({
            colors,
            isMobile,
            horizontalCount: isMobile ? 16 : isTablet ? 24 : 34,
            verticalCount: isMobile ? 12 : isTablet ? 18 : 24,
            spacing: isMobile ? 0.82 : 0.68,
            segments: isMobile ? 36 : 68,
            primaryOpacity: colors.primaryOpacity,
            secondaryOpacity: colors.secondaryOpacity,
            waveDepth: isMobile ? 0.28 : 0.36,
            bendDepth: isMobile ? 1.2 : 2.1,
            influenceRadius: isMobile ? 3.8 : 5.8,
        });

        this.loomGroup = this.loomField.create();
        this.loomGroup.position.set(isMobile ? 0 : 4.8, isMobile ? 0.6 : 0.2, -8);
        this.loomGroup.rotation.set(isMobile ? -0.18 : -0.34, isMobile ? 0 : 0.16, isMobile ? 0 : -0.08);
        this.loomGroup.scale.setScalar(isMobile ? 1.55 : 1.85);
        this.sceneManager.addToScene(this.loomGroup);
    }

    setupInteraction() {
        window.addEventListener('mousemove', this._handlePointerMove, { passive: true });
        window.addEventListener('touchmove', this._handleTouchMove, { passive: true });
    }

    setupThemeObserver() {
        this.themeObserver = new MutationObserver((mutations) => {
            const changed = mutations.some((mutation) => mutation.attributeName === 'data-md-color-scheme');
            if (changed && this.loomField) {
                this.loomField.updateColors(this.getColors());
            }
        });
        this.themeObserver.observe(document.body, { attributes: true });
    }

    getColors() {
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';

        return {
            lineColor: isDark ? 0xf7f5ef : 0x111111,
            nodeColor: isDark ? 0x8fb8ff : 0x2e5bff,
            primaryOpacity: isDark ? 0.16 : 0.14,
            secondaryOpacity: isDark ? 0.18 : 0.12,
        };
    }

    setupUpdateLoop() {
        this.sceneManager.onUpdate((time, scrollProgress) => {
            if (!this.loomField || !this.loomGroup) return;

            const isMobile = this.deviceDetector.isMobile();
            const pointerAge = performance.now() - this.lastPointerMove;
            const interactionFade = Math.max(0, 1 - pointerAge / 1600);
            const isInteracting = interactionFade > 0.02;

            this.loomGroup.rotation.x = (isMobile ? -0.18 : -0.34) + scrollProgress * 0.18;
            this.loomGroup.rotation.y = (isMobile ? 0 : 0.16) + this.pointer.x * 0.045;
            this.loomGroup.position.y = (isMobile ? 0.6 : 0.2) - scrollProgress * 1.2;

            this.loomField.update({
                elapsed: time,
                pointer: this.pointerWorld,
                isInteracting,
                interactionFade,
            });
        });
    }

    _onPointerMove(event) {
        this._setPointer(event.clientX, event.clientY);
    }

    _onTouchMove(event) {
        if (!event.touches.length) return;
        this._setPointer(event.touches[0].clientX, event.touches[0].clientY);
    }

    _setPointer(clientX, clientY) {
        const width = Math.max(window.innerWidth, 1);
        const height = Math.max(window.innerHeight, 1);

        this.pointer.x = (clientX / width) * 2 - 1;
        this.pointer.y = -(clientY / height) * 2 + 1;
        this.pointerWorld.set(this.pointer.x * 7.5, this.pointer.y * 5.2, 0);
        this.lastPointerMove = performance.now();
    }

    destroy() {
        window.removeEventListener('mousemove', this._handlePointerMove);
        window.removeEventListener('touchmove', this._handleTouchMove);
        this.themeObserver?.disconnect();
        this.sceneManager?.destroy();

        this.loomField = null;
        this.loomGroup = null;
        this.themeObserver = null;
    }
}
