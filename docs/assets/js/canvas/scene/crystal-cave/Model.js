/**
 * Crystal Cave Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const CRYSTAL_CAVE_CONFIG = {
    mobileThreshold: 768,
    defaultRadius: 10,
    performance: {
        mobile: {
            particleCount: 500,
            antialias: false,
            pixelRatio: 1.5,
            powerPreference: 'low-power'
        },
        desktop: {
            particleCount: 1000,
            antialias: true,
            pixelRatio: 2,
            powerPreference: 'high-performance'
        }
    },
    themes: {
        dark: {
            ...themes.dark,
            crystalColors: [0x111111, 0x222222, 0x0a0a0a],
            glowColor: 0xffffff,
            particleColor: 0xffffff,
            particleSize: 0.1,
            particleOpacity: 0.5,
            ambientColor: 0x111111,
            ambientIntensity: 0.2,
            lights: [
                { color: 0xffffff, intensity: 1.0, pos: [0, 5, 5] }
            ]
        },
        light: {
            ...themes.light,
            crystalColors: [0xeeeeee, 0xcccccc, 0xdddddd],
            glowColor: 0x000000,
            particleColor: 0x000000,
            particleSize: 0.1,
            particleOpacity: 0.3,
            ambientColor: 0xdddddd,
            ambientIntensity: 0.8,
            lights: [
                { color: 0x000000, intensity: 0.5, pos: [0, 5, 5] }
            ]
        }
    }
};

export function getColors() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? CRYSTAL_CAVE_CONFIG.themes.dark : CRYSTAL_CAVE_CONFIG.themes.light;
}
