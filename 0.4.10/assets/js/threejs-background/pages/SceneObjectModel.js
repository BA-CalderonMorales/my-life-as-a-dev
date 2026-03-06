export const HOME_SCENE_OBJECTS = [
    {
        kind: 'sphere',
        options: {
            radius: 2.6,
            color: 0x181818,
            opacity: 0.16,
            position: { x: -9, y: 3.8, z: -6 }
        },
        animation: { scrollInfluence: 0.46 }
    },
    {
        kind: 'sphere',
        options: {
            radius: 1.45,
            color: 0xbdbdb8,
            opacity: 0.14,
            position: { x: 10, y: -2.5, z: -11 }
        },
        animation: { scrollInfluence: 0.58 }
    },
    {
        kind: 'icosahedron',
        options: {
            radius: 1.9,
            color: 0xf7f6f0,
            opacity: 0.18,
            position: { x: 6.5, y: 5.2, z: -4.5 }
        },
        animation: { scrollInfluence: 0.5 }
    },
    {
        kind: 'octahedron',
        options: {
            radius: 1.2,
            color: 0x6f6f6a,
            opacity: 0.14,
            position: { x: -12, y: -4.5, z: -12 }
        },
        animation: { scrollInfluence: 0.7 }
    },
    {
        kind: 'torus',
        options: {
            radius: 2.8,
            tube: 0.26,
            color: 0x353535,
            opacity: 0.1,
            position: { x: 0, y: 8, z: -14 }
        },
        animation: { scrollInfluence: 0.32 }
    },
    {
        kind: 'wireframeRing',
        options: {
            innerRadius: 10,
            outerRadius: 12.5,
            color: 0x9a9a95,
            opacity: 0.045,
            position: { x: 0, y: 0, z: -22 }
        },
        animation: { enableFloat: false, scrollInfluence: 0.12 }
    },
    {
        kind: 'wireframeRing',
        options: {
            innerRadius: 14,
            outerRadius: 16.5,
            color: 0xf7f6f0,
            opacity: 0.025,
            position: { x: -4, y: -2, z: -30 }
        },
        animation: { enableFloat: false, scrollInfluence: 0.08 }
    }
];

export const PAGE_SCENE_OBJECTS = [
    {
        kind: 'sphere',
        options: {
            radius: 1.35,
            color: 0x414141,
            opacity: 0.12,
            position: { x: 0, y: 0.4, z: -8 }
        },
        animation: { scrollInfluence: 0.18 }
    },
    {
        kind: 'icosahedron',
        options: {
            radius: 0.9,
            color: 0xdeddd8,
            opacity: 0.1,
            position: { x: -3.2, y: 1.8, z: -10 }
        },
        animation: { scrollInfluence: 0.16 }
    },
    {
        kind: 'octahedron',
        options: {
            radius: 0.75,
            color: 0x767671,
            opacity: 0.08,
            position: { x: 3.4, y: -1.2, z: -12 }
        },
        animation: { scrollInfluence: 0.2 }
    },
    {
        kind: 'wireframeRing',
        options: {
            innerRadius: 4.2,
            outerRadius: 5.1,
            color: 0xbdbdb8,
            opacity: 0.03,
            position: { x: 0, y: 0, z: -15 }
        },
        animation: { enableFloat: false, scrollInfluence: 0.08 }
    }
];
