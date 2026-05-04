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
    colors: {
        background: 0x0a0a0a,
        line: 0x888888,
        node: 0x666666
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? themes.dark : themes.light;
}
