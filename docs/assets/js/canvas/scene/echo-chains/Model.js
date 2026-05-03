export const ECHO_CHAINS_THEMES = {
    light: {
        background: 0xefeee9,
        nodeColor: 0x1c1c1c,
        lineColor: 0x7a7a75,
        centralColor: 0xffffff,
        particleColor: 0x6f6f6a,
        glowColor: 0x2e2e2e,
        ambientLight: 0xffffff,
        fogColor: 0xefeee9,
    },
    dark: {
        background: 0x0e0e0d,
        nodeColor: 0xe0ded8,
        lineColor: 0x6d6b66,
        centralColor: 0xf7f5ef,
        particleColor: 0xb9b6af,
        glowColor: 0xffffff,
        ambientLight: 0x404040,
        fogColor: 0x0e0e0d,
    }
};

export const NODE_DEFINITIONS = [
    { position: [4.8, 2.1, -1.2], size: 0.28 },
    { position: [-4.3, -2.9, 0.8], size: 0.24 },
    { position: [3.1, -3.6, 2.2], size: 0.3 },
    { position: [-4.8, 1.7, -2.4], size: 0.24 },
    { position: [1.6, 4.3, 1.1], size: 0.22 },
    { position: [-2.3, -1.1, 3.3], size: 0.26 }
];

export const CONNECTIONS = [
    [null, 0], [null, 1], [null, 2], [0, 3], [1, 5], [2, 4], [4, 5]
];
