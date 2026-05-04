/**
 * Tidal Pool Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const TIDAL_POOL_CONFIG = {
    performance: {
        mobile: {
            particleCount: 2500,
            pixelRatio: 1.5,
            size: 0.12
        },
        desktop: {
            particleCount: 6000,
            pixelRatio: 2,
            size: 0.08
        }
    },
    physics: {
        waveFrequencies: [0.8, 1.5, 0.3],
        waveSpeeds: [2, 3, 1],
        waveAmps: [1.0, 0.5, 0.3],
        rippleRadius: 6.0,
        rippleForce: 0.8
    },
    colors: {
        background: 0x000510,
        teal: [0.0, 0.6, 0.8]
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? themes.dark : themes.light;
}
