/**
 * Theme Transition - Smooth animated transitions between themes
 * 
 * Handles interpolation of colors, intensities, and fog settings
 * when switching between light and dark modes.
 */
import * as THREE from 'three';

export class ThemeTransition {
    constructor(options) {
        this.scene = options.scene;
        this.renderer = options.renderer;
        this.materials = options.materials;
        this.particleSystem = options.particleSystem;
        this.lightingSystem = options.lightingSystem;
        this.crystalAnimator = options.crystalAnimator;

        this.isTransitioning = false;
        this.duration = 800;
    }

    /**
     * Animate transition to new theme
     * @param {Object} fromColors - Current theme colors
     * @param {Object} toColors - Target theme colors
     */
    transition(fromColors, toColors) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const startTime = performance.now();

        // Store starting values
        const currentBg = this.scene.background.clone();
        const targetBg = new THREE.Color(toColors.background);
        const currentFog = this.scene.fog.color.clone();
        const targetFog = new THREE.Color(toColors.fogColor);

        const crystalCurrentColors = this.materials.map(m => m.color.clone());
        const crystalTargetColors = this.materials.map((m, i) =>
            new THREE.Color(toColors.crystalColors[i % toColors.crystalColors.length])
        );

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / this.duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            // Background and fog
            this.scene.background.lerpColors(currentBg, targetBg, eased);
            this.scene.fog.color.lerpColors(currentFog, targetFog, eased);
            this.scene.fog.near = fromColors.fogNear + (toColors.fogNear - fromColors.fogNear) * eased;
            this.scene.fog.far = fromColors.fogFar + (toColors.fogFar - fromColors.fogFar) * eased;

            // Crystal colors
            this.materials.forEach((mat, i) => {
                mat.color.lerpColors(crystalCurrentColors[i], crystalTargetColors[i], eased);
            });

            // Renderer exposure
            this.renderer.toneMappingExposure = fromColors.toneMappingExposure +
                (toColors.toneMappingExposure - fromColors.toneMappingExposure) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isTransitioning = false;

                // Final updates
                this.particleSystem.updateTheme(
                    toColors.particleColor,
                    toColors.particleSize,
                    toColors.particleOpacity
                );
                this.lightingSystem.updateTheme(toColors);
                this.crystalAnimator.setGlowColor(toColors.glowColor);
            }
        };

        requestAnimationFrame(animate);
    }
}
