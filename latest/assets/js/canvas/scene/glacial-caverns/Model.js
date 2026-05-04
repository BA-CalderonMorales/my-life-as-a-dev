/**
 * Glacial Caverns Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const GLACIAL_CONFIG = {
    mobile: {
        blockCount: 15,
        camDistance: 12
    },
    desktop: {
        blockCount: 30,
        camDistance: 16
    },
    physics: {
        driftSpeed: 0.15,
        rotationSpeed: 0.3
    },
    themes: {
        dark: {
            ...themes.dark,
            ice: [0x88ccff, 0xbbddff, 0xaaddff],
            light: 0x44aaff,
            ambient: 0x223344
        },
        light: {
            ...themes.light,
            ice: [0x4488ff, 0x88bbff, 0x66aaff],
            light: 0x004488,
            ambient: 0xdddddd
        }
    },
    lightPositions: [
        [5, 5, 5],
        [-5, -5, -5],
        [0, 8, -2]
    ]
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? GLACIAL_CONFIG.themes.dark : GLACIAL_CONFIG.themes.light;
}
