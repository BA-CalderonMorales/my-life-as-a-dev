/**
 * Digital Rain Model - Configuration and Shared Constants
 */
import { themes } from '../themes/ThemeConfig.js';

export const DIGITAL_RAIN_CONFIG = {
    columns: 50,
    performance: {
        mobile: {
            particlesPerColumn: 20,
        },
        desktop: {
            particlesPerColumn: 30,
        }
    },
    physics: {
        speedMin: 3,
        speedMax: 7,
        resetY: 12,
        bottomY: -12,
        flashDecay: 2.0,
    },
    themes: {
        dark: {
            ...themes.dark,
            floor: 0x003300,
            baseGreenMin: 0.1,
            baseGreenMax: 0.25,
            flashOpacity: 0.85
        },
        light: {
            ...themes.light,
            floor: 0x00ff00,
            baseGreenMin: 0.2,
            baseGreenMax: 0.4,
            flashOpacity: 0.6
        }
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? DIGITAL_RAIN_CONFIG.themes.dark : DIGITAL_RAIN_CONFIG.themes.light;
}
