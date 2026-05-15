/**
 * Bismuth Fracture Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const BISMUTH_CONFIG = {
    performance: {
        mobile: {
            stackCount: 6,
        },
        desktop: {
            stackCount: 12,
        }
    },
    stepsMin: 5,
    stepsMax: 12,
    physics: {
        baseSizeMin: 1.2,
        baseSizeMax: 2.2,
        distMin: 2,
        distMax: 8,
        rotSpeedMax: 0.004
    },
    themes: {
        dark: {
            ...themes.dark,
            ambient: 0x333333,
            directional: 0xffffff
        },
        light: {
            ...themes.light,
            ambient: 0xcccccc,
            directional: 0x444444
        }
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? BISMUTH_CONFIG.themes.dark : BISMUTH_CONFIG.themes.light;
}
