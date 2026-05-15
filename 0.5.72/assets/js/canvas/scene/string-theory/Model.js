/**
 * String Theory Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const STRING_THEORY_CONFIG = {
    performance: {
        mobile: {
            stringCount: 120,
            stringLength: 18,
            pixelRatio: 1.5
        },
        desktop: {
            stringCount: 220,
            stringLength: 26,
            pixelRatio: 2
        }
    },
    physics: {
        driftSpeed: 2.0,
        rotationBase: 0.1,
        rotationVariance: 0.15
    },
    colors: {
        background: 0x0a0a0a,
        line: 0x888888,
        opacity: 0.18
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? themes.dark : themes.light;
}
