/**
 * Quantum Lattice Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const QUANTUM_LATTICE_CONFIG = {
    performance: {
        mobile: {
            gridSize: 5,
            spacing: 1.55,
            octaSize: 0.13,
            pixelRatio: 1.5
        },
        tablet: {
            gridSize: 6,
            spacing: 1.48,
            octaSize: 0.12,
            pixelRatio: 1.8
        },
        desktop: {
            gridSize: 7,
            spacing: 1.48,
            octaSize: 0.115,
            pixelRatio: 2
        }
    },
    physics: {
        speedRange: [6, 15],
        ampRange: [0.035, 0.09],
        snapPower: 0.28
    },
    themes: {
        dark: {
            ...themes.dark,
            nodeColor: 0xe0ded8,
            glowColor: 0xf7f5ef,
            lineColor: 0x6d6b66,
            emissiveBase: 0.42,
            lineOpacity: 0.2
        },
        light: {
            ...themes.light,
            nodeColor: 0x1c1c1c,
            glowColor: 0x4e4e49,
            lineColor: 0x7a7a75,
            emissiveBase: 0.28,
            lineOpacity: 0.14
        }
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? QUANTUM_LATTICE_CONFIG.themes.dark : QUANTUM_LATTICE_CONFIG.themes.light;
}
