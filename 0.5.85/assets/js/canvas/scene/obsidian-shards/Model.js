/**
 * Obsidian Shards Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const OBSIDIAN_CONFIG = {
    performance: {
        mobile: {
            shardCount: 15,
            camDist: 14
        },
        desktop: {
            shardCount: 40,
            camDist: 18
        }
    },
    physics: {
        driftSpeed: 0.12,
        rotSpeedMax: 0.4
    },
    themes: {
        dark: {
            ...themes.dark,
            obsidian: 0x050505,
            lights: [0x4444ff, 0xff44ff, 0x44ffff]
        },
        light: {
            ...themes.light,
            obsidian: 0x222222,
            lights: [0x0000ff, 0xff00ff, 0x00ffff]
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
    return scheme === 'slate' ? OBSIDIAN_CONFIG.themes.dark : OBSIDIAN_CONFIG.themes.light;
}
