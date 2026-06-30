/**
 * Smoke Mirrors Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const SMOKE_MIRRORS_CONFIG = {
    performance: {
        mobile: {
            particleCount: 1000,
            pixelRatio: 1.5,
            size: 0.5
        },
        desktop: {
            particleCount: 2000,
            pixelRatio: 2,
            size: 0.4
        }
    },
    physics: {
        driftSpeed: 0.3,
        turbulence: 0.5,
        pushRadiusSq: 9,
        pushForce: 0.1
    },
    mirrorPositions: [
        { x: -5, y: 2, z: -3 },
        { x: 4, y: -1, z: -4 },
        { x: 0, y: 3, z: -5 }
    ],
    colors: {
        smoke: 0x888888,
        background: 0x0a0a0a,
        mirror: 0xcccccc
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? themes.dark : themes.light;
}
