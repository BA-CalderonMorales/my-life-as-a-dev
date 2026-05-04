/**
 * Holographic Sand Model - Configuration and Constants
 */
export const HOLOGRAPHIC_SAND_CONFIG = {
    performance: {
        mobile: {
            particleCount: 3000,
            pixelRatio: 1.5,
            size: 0.08
        },
        desktop: {
            particleCount: 8000,
            pixelRatio: 2,
            size: 0.05
        }
    },
    states: {
        DRIFTING: 'drifting',
        FORMING: 'forming',
        HOLDING: 'holding',
        RETURNING: 'returning'
    },
    shapes: ['tetrahedron', 'cube', 'sphere', 'torus'],
    colors: {
        sand: 0x55ffff,
        background: 0x050505,
        grid: 0x113333,
        gridSub: 0x0a2222
    },
    timings: {
        hold: 2.5,
        formSpeed: 1.2
    }
};
