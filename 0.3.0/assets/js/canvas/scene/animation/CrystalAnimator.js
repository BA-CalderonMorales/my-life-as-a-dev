/**
 * Crystal Animator - Handles crystal breathing and glow effects
 * 
 * Animates individual crystals with subtle rotation oscillation,
 * scale pulsing, and emissive glow on hover/focus.
 */
import * as THREE from 'three';

export class CrystalAnimator {
    constructor(crystals, materials, glowColor) {
        this.crystals = crystals;
        this.materials = materials;
        this.glowColor = new THREE.Color(glowColor);
    }

    /**
     * Update crystal animations
     * @param {number} elapsed - Time elapsed in seconds
     * @param {Function} isActiveCheck - Function to check if crystal is hovered/focused
     */
    update(elapsed, isActiveCheck) {
        this.crystals.forEach((crystal, i) => {
            const { animOffset, animSpeed, baseRotX, baseRotZ } = crystal.userData;
            const wave = Math.sin(elapsed * animSpeed + animOffset);

            // Subtle rotation oscillation
            crystal.rotation.x = baseRotX + wave * 0.02;
            crystal.rotation.z = baseRotZ + Math.cos(elapsed * animSpeed * 0.7 + animOffset) * 0.015;

            // Glow targeting
            const isActive = isActiveCheck(crystal);
            crystal.userData.targetGlow = isActive ? 1 : 0;
            crystal.userData.glowIntensity +=
                (crystal.userData.targetGlow - crystal.userData.glowIntensity) * 0.1;

            // Scale pulse with hover boost
            const baseScale = 1 + wave * 0.02;
            const hoverScale = 1 + crystal.userData.glowIntensity * 0.15;
            crystal.scale.setScalar(baseScale * hoverScale);

            // Emissive glow
            this.materials[i].emissive = this.glowColor;
            this.materials[i].emissiveIntensity = crystal.userData.glowIntensity * 0.5;
        });
    }

    /**
     * Update glow color for theme change
     */
    setGlowColor(color) {
        this.glowColor.setHex(color);
    }
}
