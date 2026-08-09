/**
 * Neon Geode Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const NEON_GEODE_CONFIG = {
    performance: {
        mobile: {
            crystalCount: 15,
            sparkleCount: 400,
            camDist: 11
        },
        desktop: {
            crystalCount: 38,
            sparkleCount: 1200,
            camDist: 10.5
        }
    },
    physics: {
        orbitSpeed: 0.012,
        pulseSpeedRange: [0.75, 2.0],
        sparkleSpeed: [0.003, 0.009]
    },
    palette: [0x00f6ff, 0x1d2c6c, 0xb7ffff, 0x47a7ff, 0x130018],
    lightConfigs: [
        { position: [4, 5, 2], color: 0x00f6ff, intensity: 2.2 },
        { position: [-6, -2, -3], color: 0x130018, intensity: 1.8 }
    ],
    themes: {
        dark: {
            ...themes.dark,
            floor: 0x08070d,
            core: 0x00f6ff
        },
        light: {
            ...themes.light,
            floor: 0xeeeeee,
            core: 0x008888
        }
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? NEON_GEODE_CONFIG.themes.dark : NEON_GEODE_CONFIG.themes.light;
}
