/**
 * Loom Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const LOOM_CONFIG = {
    performance: {
        mobile: {
            horizontalCount: 16,
            verticalCount: 16,
            spacing: 0.7,
            segments: 30,
            pixelRatio: 1.5
        },
        desktop: {
            horizontalCount: 22,
            verticalCount: 22,
            spacing: 0.5,
            segments: 55,
            pixelRatio: 2
        }
    },
    physics: {
        waveDepth: 0.15,
        bendDepth: 1.4,
        influenceRadius: 4.5,
        primaryOpacity: 0.35,
        secondaryOpacity: 0.35
    },
    themes: {
        dark: {
            ...themes.dark,
            lineColor: 0x888888,
            nodeColor: 0x666666
        },
        light: {
            ...themes.light,
            lineColor: 0x7a7a75,
            nodeColor: 0x1c1c1c
        }
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? LOOM_CONFIG.themes.dark : LOOM_CONFIG.themes.light;
}
