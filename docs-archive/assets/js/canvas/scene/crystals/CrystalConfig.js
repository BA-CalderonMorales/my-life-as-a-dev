/**
 * Crystal Configuration - Positions, sizes, and arrangements
 * 
 * Defines the crystal cave layout with varying sizes and orientations
 * to create an organic, natural cave formation feel.
 */

export const crystalConfigs = [
    // Central dominant crystal cluster
    { pos: [0, 0, 0], height: 2.5, radius: 0.6, rotX: 0.1, rotZ: 0.05 },

    // Surrounding crystals at various angles
    { pos: [-2.5, -1, 1], height: 3.2, radius: 0.5, rotX: 0.3, rotZ: -0.4 },
    { pos: [2.8, -0.5, 0.5], height: 2.8, radius: 0.45, rotX: -0.2, rotZ: 0.5 },
    { pos: [-1.5, 1.5, -1], height: 2.0, radius: 0.35, rotX: 0.4, rotZ: 0.3 },
    { pos: [1.8, 2, -0.5], height: 1.8, radius: 0.4, rotX: -0.35, rotZ: -0.2 },
    { pos: [0.5, -2.5, 1.5], height: 3.5, radius: 0.55, rotX: 0.15, rotZ: 0.1 },
    { pos: [-3, 0.5, -2], height: 2.2, radius: 0.3, rotX: -0.5, rotZ: 0.4 },
    { pos: [3.5, 0, -1.5], height: 1.5, radius: 0.25, rotX: 0.25, rotZ: -0.35 },

    // Background crystals - larger, further away for depth
    { pos: [-5, -3, -4], height: 5, radius: 0.8, rotX: 0.2, rotZ: -0.3 },
    { pos: [6, 2, -5], height: 4.5, radius: 0.7, rotX: -0.4, rotZ: 0.2 },
    { pos: [0, -4, -6], height: 6, radius: 1, rotX: 0.1, rotZ: 0 },
    { pos: [-4, 4, -5], height: 4, radius: 0.6, rotX: 0.3, rotZ: 0.5 },

    // Additional depth crystals
    { pos: [4, -4, -3], height: 3.8, radius: 0.65, rotX: -0.15, rotZ: 0.25 },
    { pos: [-6, 0, -5], height: 4.2, radius: 0.55, rotX: 0.35, rotZ: -0.15 },
];
