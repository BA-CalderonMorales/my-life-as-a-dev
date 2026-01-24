/**
 * Theme Configuration - Color schemes for Crystal Cave
 * 
 * Dark mode: Dramatic prismatic cave with vibrant crystal colors
 * Light mode: Monochrome obsidian gallery matching main site aesthetic
 */

export const themes = {
    dark: {
        background: 0x020206,           // Deeper cave darkness
        fogColor: 0x080812,             // Rich blue-black fog
        fogNear: 2,
        fogFar: 16,
        crystalColors: [
            0xc8f0ff,                   // Brilliant ice
            0xffffff,                   // Pure white crystal
            0xa0e8ff,                   // Glacial blue
            0xe8f8ff,                   // Frost white
            0x80d4ff,                   // Sky crystal
        ],
        glowColor: 0x40ffff,            // Bright cyan glow
        particleColor: 0x88ccff,
        particleOpacity: 0.8,
        particleSize: 0.06,
        ambientColor: 0x102030,
        ambientIntensity: 0.05,
        // More dramatic prismatic lighting
        lights: [
            { color: 0x00ffff, intensity: 3.5, pos: [8, 6, 4] },      // Bright Cyan
            { color: 0xff40ff, intensity: 2.5, pos: [-7, 4, 3] },     // Hot Magenta
            { color: 0x4080ff, intensity: 2.8, pos: [0, -5, 6] },     // Electric Blue
            { color: 0x00ff99, intensity: 2.0, pos: [-4, 8, -2] },    // Neon Teal
            { color: 0xffffff, intensity: 4.0, pos: [0, 10, 0] },     // Strong White key
            { color: 0xff8040, intensity: 1.5, pos: [5, -6, -3] },    // Warm accent
        ],
        // Renderer settings
        toneMappingExposure: 1.4,
    },
    light: {
        background: 0xfafafa,           // Clean white
        fogColor: 0xf5f5f5,
        fogNear: 5,
        fogFar: 25,
        crystalColors: [
            0x1a1a1a,                   // Rich black
            0x2a2a2a,                   // Dark gray
            0x0f0f0f,                   // Deep black
            0x3a3a3a,                   // Charcoal
            0x151515,                   // Near black
        ],
        glowColor: 0x555555,            // Subtle gray glow
        particleColor: 0x888888,        // Match main background
        particleOpacity: 0.6,
        particleSize: 0.05,
        ambientColor: 0xffffff,
        ambientIntensity: 0.5,
        lights: [
            { color: 0xffffff, intensity: 1.8, pos: [8, 6, 4] },
            { color: 0xf8f8f8, intensity: 1.4, pos: [-7, 4, 3] },
            { color: 0xffffff, intensity: 1.2, pos: [0, -5, 6] },
            { color: 0xf0f0f0, intensity: 1.0, pos: [-4, 8, -2] },
            { color: 0xffffff, intensity: 2.2, pos: [0, 10, 0] },
            { color: 0xfafafa, intensity: 0.8, pos: [5, -6, -3] },
        ],
        toneMappingExposure: 1.0,
    }
};

/**
 * Get current theme based on MkDocs Material color scheme
 */
export function getCurrentTheme() {
    const scheme = document.body.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? 'dark' : 'light';
}

/**
 * Get theme colors for current scheme
 */
export function getThemeColors() {
    return themes[getCurrentTheme()];
}
