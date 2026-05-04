/**
 * Crystal Cave Model - Configuration
 */
import { themes } from '../themes/ThemeConfig.js';

export const CRYSTAL_CAVE_CONFIG = {
    themes,
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
    }
};
