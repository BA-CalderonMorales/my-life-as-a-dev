/**
 * Lighting System - restrained cave lighting
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

        // Point lights for restrained depth and edge definition
        themeColors.lights.forEach(lightConfig => {
            const light = new THREE.PointLight(
                lightConfig.color,
                lightConfig.intensity,
                28,
                1.8
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
            light.position.x = basePos[0] + Math.sin(elapsed * 0.35 + i * 1.2) * 0.3;
            light.position.y = basePos[1] + Math.cos(elapsed * 0.22 + i * 0.8) * 0.2;
            light.position.z = basePos[2] + Math.sin(elapsed * 0.28 + i * 1.5) * 0.14;
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
