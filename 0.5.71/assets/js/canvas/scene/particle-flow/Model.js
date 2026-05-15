/**
 * Particle Flow Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const PARTICLE_FLOW_CONFIG = {
    performance: {
        mobile: {
            particleCount: 2000,
            pixelRatio: 1.5,
            size: 0.12
        },
        desktop: {
            particleCount: 8000,
            pixelRatio: 2,
            size: 0.08
        }
    },
    physics: {
        fieldScale: 0.08,
        driftSpeed: 0.1,
        noiseAmount: 0.015,
        pushRadiusSq: 16,
        pushForce: 0.08
    },
    colors: {
        background: 0x050505,
        particle: 0x888888,
        accent: 0x44aaff
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? themes.dark : themes.light;
}
