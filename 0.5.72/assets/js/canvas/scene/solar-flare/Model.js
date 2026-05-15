/**
 * Solar Flare Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const SOLAR_FLARE_CONFIG = {
    performance: {
        mobile: {
            particleCount: 4000,
            pixelRatio: 1.5,
            size: 0.15
        },
        desktop: {
            particleCount: 8000,
            pixelRatio: 2,
            size: 0.12
        }
    },
    physics: {
        minSpeed: 1.5,
        maxSpeed: 4.5,
        acceleration: 1.01,
        minLifetime: 2.0,
        maxLifetime: 5.0
    },
    colors: {
        background: 0x050200,
        sun: 0xffaa00,
        glow: 0xff4400,
        particleInitial: [1.0, 0.9, 0.6]
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? themes.dark : themes.light;
}
