/**
 * Zen Geometry Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const ZEN_GEOMETRY_CONFIG = {
    performance: {
        mobile: {
            nodeScale: 0.85,
            pixelRatio: 1.5,
            camDistance: 14,
            icoSize: 2.2
        },
        desktop: {
            nodeScale: 1.0,
            pixelRatio: 2.0,
            camDistance: 20,
            icoSize: 2.5
        }
    },
    physics: {
        orbitSpeed: 0.012,
        driftSpeed: 0.5
    },
    themes: {
        dark: {
            ...themes.dark,
            centralColor: 0x1c1c1c,
            nodeColor: 0xe0ded8,
            glowColor: 0xf7f5ef,
            lineColor: 0x6d6b66,
        },
        light: {
            ...themes.light,
            centralColor: 0xf2f1ed,
            nodeColor: 0x1c1c1c,
            glowColor: 0x4e4e49,
            lineColor: 0x7a7a75,
        }
    }
};

export const ZEN_NODE_DEFINITIONS = [
    { position: [5, 2, -3], size: 0.8 },
    { position: [-4, -3, 2], size: 0.9 },
    { position: [2, 6, 1], size: 0.7 },
    { position: [-6, 1, -4], size: 1.1 },
    { position: [0, -5, -6], size: 0.85 },
];

export const ZEN_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
    [0, 2], [1, 3]
];

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? ZEN_GEOMETRY_CONFIG.themes.dark : ZEN_GEOMETRY_CONFIG.themes.light;
}
