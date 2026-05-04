/**
 * Bismuth Fracture Model - Configuration
 */
export const BISMUTH_CONFIG = {
    mobile: {
        stackCount: 6,
    },
    desktop: {
        stackCount: 12,
    },
    stepsMin: 5,
    stepsMax: 12,
    physics: {
        baseSizeMin: 1.2,
        baseSizeMax: 2.2,
        distMin: 2,
        distMax: 8,
        rotSpeedMax: 0.004
    },
    colors: {
        background: 0x080808,
        ambient: 0x333333,
        directional: 0xffffff
    }
};
