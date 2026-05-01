/**
 * Theme Configuration - restrained monochrome palettes for Crystal Cave
 */

export const themes = {
    dark: {
        background: 0x0e0e0d,
        fogColor: 0x111111,
        fogNear: 3,
        fogFar: 18,
        crystalColors: [
            0xf2f1ed,
            0xd2d0ca,
            0xb7b5af,
            0x8c8a84,
            0x66645f,
        ],
        glowColor: 0xb7b5af,
        particleColor: 0xc2c0b9,
        particleOpacity: 0.26,
        particleSize: 0.042,
        ambientColor: 0x1a1a19,
        ambientIntensity: 0.18,
        lights: [
            { color: 0xffffff, intensity: 1.2, pos: [8, 6, 4] },
            { color: 0xc9c7c0, intensity: 0.8, pos: [-7, 4, 3] },
            { color: 0x8f8d87, intensity: 0.65, pos: [0, -5, 6] },
            { color: 0xf2f1ed, intensity: 1.0, pos: [0, 9, 0] },
        ],
        toneMappingExposure: 1.0,
    },
    light: {
        background: 0xefeee9,
        fogColor: 0xe5e3dd,
        fogNear: 5,
        fogFar: 25,
        crystalColors: [
            0x1c1c1c,
            0x353535,
            0x4d4d4a,
            0x676762,
            0x85857f,
        ],
        glowColor: 0x4e4e49,
        particleColor: 0x757570,
        particleOpacity: 0.22,
        particleSize: 0.038,
        ambientColor: 0xffffff,
        ambientIntensity: 0.34,
        lights: [
            { color: 0xffffff, intensity: 0.95, pos: [8, 6, 4] },
            { color: 0xd8d6d0, intensity: 0.7, pos: [-7, 4, 3] },
            { color: 0xb7b5af, intensity: 0.5, pos: [0, -5, 6] },
            { color: 0xf2f1ed, intensity: 0.75, pos: [0, 9, 0] },
        ],
        toneMappingExposure: 0.92,
    }
};

/**
 * Get current theme based on MkDocs Material color scheme
 */
export function getCurrentTheme() {
    const scheme = document.body?.getAttribute('data-md-color-scheme');
    if (scheme) {
        return scheme === 'slate' ? 'dark' : 'light';
    }

    try {
        const paletteObj = JSON.parse(localStorage.getItem('__md_param') || '{}').palette;
        if (paletteObj && paletteObj.color && paletteObj.color.scheme) {
            return paletteObj.color.scheme === 'slate' ? 'dark' : 'light';
        }
    } catch(e) {}
    
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get theme colors for current scheme
 */
export function getThemeColors() {
    return themes[getCurrentTheme()];
}
