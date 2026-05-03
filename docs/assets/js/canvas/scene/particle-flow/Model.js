export const PARTICLE_FLOW_CONFIG = {
    desktop: {
        count: 9000,
        size: 0.055,
    },
    mobile: {
        count: 3600,
        size: 0.075,
    }
};

export const getColors = () => {
    const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
    return {
        background: isDark ? 0x0e0e0d : 0xefeee9,
        particle: isDark ? 0xb9b6af : 0x5f5f5a,
        accent: isDark ? 0xffffff : 0x1c1c1c,
    };
};
