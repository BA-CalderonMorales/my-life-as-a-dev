/**
 * Origami Unfolding Model - Configuration
 */
export const ORIGAMI_CONFIG = {
    performance: {
        mobile: {
            planeSize: 2.2,
            distance: 3.5,
            pixelRatio: 1.5
        },
        desktop: {
            planeSize: 3.0,
            distance: 4.5,
            pixelRatio: 2
        }
    },
    normals: [
        [0, 1, 1.618], [0, 1, -1.618], [0, -1, 1.618], [0, -1, -1.618],
        [1, 1.618, 0], [1, -1.618, 0], [-1, 1.618, 0], [-1, -1.618, 0],
        [1.618, 0, 1], [1.618, 0, -1], [-1.618, 0, 1], [-1.618, 0, -1],
    ],
    themes: {
        dark: {
            background: 0x0e0e0d,
            plane: 0xf2f1ed,
            glow: 0xb7b5af,
            line: 0x6d6b66,
            ambient: 0x404040,
            fog: 0x0e0e0d
        },
        light: {
            background: 0xefeee9,
            plane: 0x1c1c1c,
            glow: 0x4e4e49,
            line: 0x7a7a75,
            ambient: 0xffffff,
            fog: 0xefeee9
        }
    }
};
