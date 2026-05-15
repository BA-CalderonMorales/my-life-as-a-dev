/**
 * Holographic Sand Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const HOLOGRAPHIC_SAND_CONFIG = {
    performance: {
        mobile: {
            particleCount: 3000,
            pixelRatio: 1.5,
            size: 0.08
        },
        desktop: {
            particleCount: 8000,
            pixelRatio: 2,
            size: 0.05
        }
    },
    states: {
        DRIFTING: 'drifting',
        FORMING: 'forming',
        HOLDING: 'holding',
        RETURNING: 'returning'
    },
    shapes: ['tetrahedron', 'cube', 'sphere', 'torus'],
    themes: {
        dark: {
            ...themes.dark,
            sand: 0x55ffff,
            grid: 0x113333,
            gridSub: 0x0a2222
        },
        light: {
            ...themes.light,
            sand: 0x008888,
            grid: 0xcccccc,
            gridSub: 0xeeeeee
        }
    },
    timings: {
        hold: 2.5,
        formSpeed: 1.2
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? HOLOGRAPHIC_SAND_CONFIG.themes.dark : HOLOGRAPHIC_SAND_CONFIG.themes.light;
}
