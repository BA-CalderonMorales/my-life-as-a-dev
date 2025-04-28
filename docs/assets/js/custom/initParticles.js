/**
 * Initializer for the Particle Background
 * This script initializes and starts the particle background animation
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and start the particle background with a slight delay
    // to ensure the theme is properly loaded
    setTimeout(() => {
        try {
            console.log('Initializing particle background...');
            const particleBackground = new ParticleBackground();
            particleBackground.start();
            console.log('Particle background started successfully');
        } catch (error) {
            console.error('Failed to initialize particle background:', error);
        }
    }, 500);
});