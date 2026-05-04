/**
 * Digital Rain Model - Configuration and Shared Constants
 */
export const DIGITAL_RAIN_CONFIG = {
    columns: 50,
    mobile: {
        particlesPerColumn: 20,
    },
    desktop: {
        particlesPerColumn: 30,
    },
    physics: {
        speedMin: 3,
        speedMax: 7,
        resetY: 12,
        bottomY: -12,
        flashDecay: 2.0,
    },
    colors: {
        background: 0x020202,
        floor: 0x003300,
        baseGreenMin: 0.1,
        baseGreenMax: 0.25,
        flashOpacity: 0.85
    }
};
