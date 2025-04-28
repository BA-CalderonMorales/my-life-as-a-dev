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
        
        // Initial dark mode detection
        this.isDarkMode = document.body.getAttribute('data-md-color-scheme') === 'slate';
        
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
        
        // Create material based on current theme
        const material = new THREE.PointsMaterial({
            size: 0.5,
            color: this.isDarkMode ? 0x555555 : 0xcccccc,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        return new THREE.Points(geometry, material);
    }
    
    /**
     * Updates particle colors based on current theme
     */
    updateParticlesTheme() {
        // Update particle material color based on theme
        if (this.particles) {
            const material = this.particles.material;
            material.color.set(this.isDarkMode ? 0x555555 : 0xcccccc);
        }
    }

    /**
     * Sets up a listener for theme changes
     */
    setupThemeChangeListener() {
        // Use MutationObserver to detect theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-md-color-scheme') {
                    this.isDarkMode = document.body.getAttribute('data-md-color-scheme') === 'slate';
                    this.updateParticlesTheme();
                }
            });
        });
        
        // Start observing body for theme changes
        observer.observe(document.body, { 
            attributes: true, 
            attributeFilter: ['data-md-color-scheme'] 
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