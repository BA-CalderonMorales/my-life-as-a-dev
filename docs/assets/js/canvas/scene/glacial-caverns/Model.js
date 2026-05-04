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
    colors: {
        background: 0x000818,
        ambient: 0x223344,
        light: 0x44aaff,
        ice: [0x88ccff, 0xbbddff, 0xaaddff]
    },
    lightPositions: [
        [5, 5, 5],
        [-5, -5, -5],
        [0, 8, -2]
    ]
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? themes.dark : themes.light;
}
