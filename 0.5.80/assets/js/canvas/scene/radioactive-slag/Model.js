/**
 * Radioactive Slag Model - Configuration
 */
export const RADIOACTIVE_CONFIG = {
    mobile: {
        rockCount: 8,
        lightCount: 4,
    },
    desktop: {
        rockCount: 22,
        lightCount: 8,
    },
    physics: {
        flickerSpeedRange: [5, 15],
        baseIntensityRange: [1.5, 2.5],
        pulseSpeedRange: [2.0, 6.0],
        rotSpeedMax: 0.5
    },
    colors: {
        background: 0x050502,
        ambient: 0x112211,
        rock: 0x1a331a,
        glow: 0x33ff33,
        cave: 0x222222
    }
};
