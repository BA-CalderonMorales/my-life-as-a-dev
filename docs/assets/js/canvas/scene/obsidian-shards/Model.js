/**
 * Obsidian Shards Model - Configuration
 */
export const OBSIDIAN_CONFIG = {
    mobile: {
        shardCount: 15,
        camDist: 14
    },
    desktop: {
        shardCount: 40,
        camDist: 18
    },
    physics: {
        driftSpeed: 0.12,
        rotSpeedMax: 0.4
    },
    colors: {
        background: 0x111111,
        ambient: 0x222222,
        obsidian: 0x050505,
        lights: [0x4444ff, 0xff44ff, 0x44ffff]
    },
    lightPositions: [
        [5, 5, 5],
        [-5, -5, -5],
        [0, 8, -2]
    ]
};
