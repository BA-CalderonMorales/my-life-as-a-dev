/**
 * Initializer for the Particle Background
 * This script initializes and starts the particle background animation
 */

// Initialize particles when DOM is ready
let particleBackground = null;

function initializeParticles() {
    try {
        console.log('Initializing particle background...');
        
        // Create and start the particle background
        particleBackground = new ParticleBackground();
        particleBackground.start();
        
        // Log success message
        console.log('Particle background started successfully');
    } catch (error) {
        console.error('Failed to initialize particle background:', error);
    }
}

// Set up a global theme change detector directly on document for maximum compatibility
document.addEventListener('click', function(event) {
    // Check for any click that might be related to the theme switcher
    const themeElements = ['[data-md-component="palette"]', '.md-header__button', '.md-icon'];
    
    // Check if the click target matches any potential theme switcher elements
    let isThemeClick = false;
    themeElements.forEach(selector => {
        if (event.target.closest(selector)) {
            isThemeClick = true;
        }
    });
    
    if (isThemeClick) {
        console.log('Potential theme change detected');
        
        // Use multiple timeouts to ensure we catch the theme change
        // regardless of when it happens
        [100, 300, 500].forEach(delay => {
            setTimeout(() => {
                if (particleBackground) {
                    console.log(`Updating particles after ${delay}ms`);
                    particleBackground.forceDarkModeDetection();
                }
            }, delay);
        });
    }
});

// Initialize when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeParticles);
} else {
    // If DOMContentLoaded has already fired
    initializeParticles();
}

// Also ensure we catch theme changes on window load
window.addEventListener('load', () => {
    // Force an update after page has fully loaded
    setTimeout(() => {
        if (particleBackground) {
            particleBackground.forceDarkModeDetection();
        }
    }, 200);
});