/**
 * Particle Background using THREE.js
 * Creates an animated particle background that adapts to both light and dark themes
 */

/**
 * @class ParticleBackground
 * @description Creates and manages a THREE.js particle animation in the background
 */
class ParticleBackground {
    /**
     * Creates a new particle background
     * @param {string} containerId - ID of the container element (will be created if it doesn't exist)
     */
    constructor(containerId = 'particle-background') {
        // Check if container exists, if not create it
        if (!document.getElementById(containerId)) {
            const container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '-1';
            container.style.pointerEvents = 'none';
            document.body.prepend(container);
        }
        
        this.container = document.getElementById(containerId);
        
        // Initial dark mode detection with stronger approach
        this.forceDarkModeDetection();
        
        // Initialize THREE.js components
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        
        // Create particles
        this.particles = this.createParticles();
        this.scene.add(this.particles);
        
        // Set camera position
        this.camera.position.z = 20;
        
        // Add event listeners
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Listen for theme changes
        this.setupThemeChangeListener();
        
        // Animation ID reference
        this.animationId = null;
    }

    /**
     * Direct check for dark mode with multiple approaches
     */
    forceDarkModeDetection() {
        // Check multiple ways to detect dark mode
        const htmlScheme = document.documentElement.getAttribute('data-md-color-scheme');
        const bodyScheme = document.body.getAttribute('data-md-color-scheme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set dark mode status
        this.isDarkMode = (htmlScheme === 'slate' || bodyScheme === 'slate');
        
        // Force update particle colors immediately
        if (this.particles && this.particles.material) {
            this.updateParticleColors();
        }
        
        console.log('Force theme detection - Dark mode:', this.isDarkMode, 'HTML scheme:', htmlScheme, 'Body scheme:', bodyScheme);
    }
    
    /**
     * Direct color update function
     */
    updateParticleColors() {
        if (!this.particles || !this.particles.material) return;
        
        const material = this.particles.material;
        
        if (this.isDarkMode) {
            // Dark mode colors
            material.color.setHex(0x555555);
            material.size = 0.5;
            material.opacity = 0.8;
        } else {
            // Light mode - MORE VISIBLE colors
            material.color.setHex(0x666666); // Darker color for visibility
            material.size = 1.0;           // Larger size 
            material.opacity = 0.7;        // Higher opacity
        }
        
        // Force material update
        material.needsUpdate = true;
    }

    /**
     * Creates the particle system
     * @returns {THREE.Points} - The particle system
     */
    createParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positionArray = new Float32Array(particleCount * 3);
        
        // Create random positions for particles
        for (let i = 0; i < particleCount * 3; i += 3) {
            // Random positions in a sphere
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            
            positionArray[i] = x;
            positionArray[i + 1] = y;
            positionArray[i + 2] = z;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        
        // Create material with much more visible light mode settings
        const material = new THREE.PointsMaterial({
            size: this.isDarkMode ? 0.5 : 1.0,
            color: this.isDarkMode ? 0x555555 : 0x666666,
            transparent: true,
            opacity: this.isDarkMode ? 0.8 : 0.7,
            blending: THREE.AdditiveBlending
        });
        
        return new THREE.Points(geometry, material);
    }
    
    /**
     * Updates particle colors based on current theme
     */
    updateParticlesTheme() {
        // Force check current theme
        this.forceDarkModeDetection();
        
        // Direct update of colors
        this.updateParticleColors();
    }

    /**
     * Sets up a listener for theme changes
     */
    setupThemeChangeListener() {
        // Direct event listener for the theme toggle button
        document.addEventListener('click', (e) => {
            // Look for clicks on or near theme switcher
            if (e.target.closest('.md-header__button[data-md-component="palette"]')) {
                console.log('Theme button click detected');
                
                // Wait for theme to apply then update
                setTimeout(() => {
                    this.forceDarkModeDetection();
                }, 100);
            }
        });
        
        // MutationObserver approach as backup
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                   (mutation.attributeName === 'data-md-color-scheme' || 
                    mutation.attributeName === 'class')) {
                    // Allow time for theme change to fully apply
                    setTimeout(() => this.updateParticlesTheme(), 100);
                }
            });
        });
        
        // Start observing both html and body elements
        observer.observe(document.documentElement, { 
            attributes: true,
            attributeFilter: ['data-md-color-scheme', 'class']
        });
        
        observer.observe(document.body, { 
            attributes: true,
            attributeFilter: ['data-md-color-scheme', 'class']
        });
        
        // Check for initial theme after DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.updateParticlesTheme();
        });
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        if (this.particles) {
            // Rotate the particles slowly
            this.particles.rotation.x += 0.0005;
            this.particles.rotation.y += 0.0005;
            
            // Make particles move slightly
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i] * 0.1) * 0.01;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handles window resize events
     */
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Starts the particle animation
     */
    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    /**
     * Stops the particle animation
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}