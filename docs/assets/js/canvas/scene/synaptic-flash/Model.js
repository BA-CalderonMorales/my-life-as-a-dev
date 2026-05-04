/**
 * Synaptic Flash Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const SYNAPTIC_FLASH_CONFIG = {
    performance: {
        mobile: {
            nodeCount: 20,
            sphereSize: 0.14,
            pixelRatio: 1.5
        },
        desktop: {
            nodeCount: 35,
            sphereSize: 0.12,
            pixelRatio: 2
        }
    },
    physics: {
        pulseDecay: 0.5,
        pulseIntervalRange: [0.8, 1.5],
        propagateChance: 0.35,
        decaySpeed: 0.92,
        lerpFactor: 0.15
    },
    themes: {
        dark: {
            ...themes.dark,
            nodeColor: 0xe0ded8,
            lineColor: 0x6d6b66,
            nodeEmissive: 0.1,
            brightEmissive: 0.8,
            lineOpacity: 0.15,
            brightOpacity: 0.6
        },
        light: {
            ...themes.light,
            nodeColor: 0x1c1c1c,
            lineColor: 0x7a7a75,
            nodeEmissive: 0.08,
            brightEmissive: 0.7,
            lineOpacity: 0.12,
            brightOpacity: 0.5
        }
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? SYNAPTIC_FLASH_CONFIG.themes.dark : SYNAPTIC_FLASH_CONFIG.themes.light;
}
