/**
 * Magnetic Dust Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const MAGNETIC_DUST_CONFIG = {
    performance: {
        mobile: {
            particleCount: 3000,
            pixelRatio: 1.5,
            size: 0.08
        },
        desktop: {
            particleCount: 10000,
            pixelRatio: 2,
            size: 0.04
        }
    },
    physics: {
        fieldScale: 0.4,
        driftSpeed: 0.016,
        magnetRadiusSq: 25,
        magnetForce: 0.025,
        noiseAmount: 0.005
    },
    themes: {
        dark: {
            ...themes.dark,
            dust: 0xaaaaaa
        },
        light: {
            ...themes.light,
            dust: 0x333333
        }
    },
    bounds: {
        x: 15,
        y: 10,
        z: 5
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? MAGNETIC_DUST_CONFIG.themes.dark : MAGNETIC_DUST_CONFIG.themes.light;
}
