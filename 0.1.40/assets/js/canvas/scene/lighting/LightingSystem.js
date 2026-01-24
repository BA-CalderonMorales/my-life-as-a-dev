/**
 * Lighting System - Prismatic cave lighting
 * 
 * Creates a multi-point lighting setup with colored lights
 * that shimmer and move for dynamic atmosphere.
 */
import * as THREE from 'three';

export class LightingSystem {
    constructor() {
        this.ambientLight = null;
        this.pointLights = [];
        this.baseLightPositions = [];
    }

    /**
     * Create all lights for the scene
     * @param {THREE.Scene} scene 
     * @param {Object} themeColors - Theme color configuration
     */
    create(scene, themeColors) {
        // Ambient light for base illumination
        this.ambientLight = new THREE.AmbientLight(
            themeColors.ambientColor,
            themeColors.ambientIntensity
        );
        scene.add(this.ambientLight);

        // Point lights for dramatic prismatic effect
        themeColors.lights.forEach(lightConfig => {
            const light = new THREE.PointLight(
                lightConfig.color,
                lightConfig.intensity,
                35,  // Distance
                1.5  // Decay
            );
            light.position.set(...lightConfig.pos);
            scene.add(light);

            this.pointLights.push(light);
            this.baseLightPositions.push([...lightConfig.pos]);
        });
    }

    /**
     * Animate lights for shimmer effect
     * @param {number} elapsed - Time elapsed in seconds
     */
    update(elapsed) {
        this.pointLights.forEach((light, i) => {
            const basePos = this.baseLightPositions[i];
            // Subtle orbital movement
            light.position.x = basePos[0] + Math.sin(elapsed * 0.5 + i * 1.2) * 0.8;
            light.position.y = basePos[1] + Math.cos(elapsed * 0.3 + i * 0.8) * 0.5;
            light.position.z = basePos[2] + Math.sin(elapsed * 0.4 + i * 1.5) * 0.3;
        });
    }

    /**
     * Update lights for theme change
     * @param {Object} themeColors - New theme configuration
     */
    updateTheme(themeColors) {
        this.ambientLight.color.setHex(themeColors.ambientColor);
        this.ambientLight.intensity = themeColors.ambientIntensity;

        this.pointLights.forEach((light, i) => {
            const config = themeColors.lights[i];
            if (config) {
                light.color.setHex(config.color);
                light.intensity = config.intensity;
                this.baseLightPositions[i] = [...config.pos];
            }
        });
    }

    /**
     * Get light configurations for animation
     */
    getLightConfigs() {
        return this.pointLights.map((light, i) => ({
            light,
            basePos: this.baseLightPositions[i]
        }));
    }
}
