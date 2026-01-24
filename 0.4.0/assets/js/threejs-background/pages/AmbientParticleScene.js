/**
 * AmbientParticleScene - Bruno Simon inspired ambient background
 * 
 * Creates a full-screen, immersive particle field that subtly flows
 * and responds to the page theme. Designed to complement content
 * without being distracting.
 */
import * as THREE from 'three';

export class AmbientParticleScene {
    constructor(containerId = 'threejs-bg-container') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.clock = new THREE.Clock();
        this.mousePosition = { x: 0, y: 0 };
        this.targetMousePosition = { x: 0, y: 0 };

        // Configuration based on page type
        this.config = {
            particleCount: 1500,
            particleSize: 2,
            particleOpacity: 0.4,
            flowSpeed: 0.15,
            waveAmplitude: 0.3,
            mouseInfluence: 0.02,
            colorPrimary: 0xC08752,  // Caramel
            colorSecondary: 0xF0B089, // Soft copper accent
            colorBackground: 0x120804  // Deep espresso backdrop
        };
    }

    async init() {
        try {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                return false;
            }

            await this.setupScene();
            await this.setupCamera();
            await this.setupRenderer();
            this.createParticles();
            this.attachEventListeners();
            this.startRenderLoop();

            return true;
        } catch {
            return false;
        }
    }

    async setupScene() {
        this.scene = new THREE.Scene();
    }

    async setupCamera() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;

        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 50;
    }

    async setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,  // Better performance
            alpha: true,
            powerPreference: 'low-power'
        });

        const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);

        this.container.appendChild(this.renderer.domElement);
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const count = this.config.particleCount;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const randomness = new Float32Array(count);

        const colorPrimary = new THREE.Color(this.config.colorPrimary);
        const colorSecondary = new THREE.Color(this.config.colorSecondary);

        // Detect theme
        const isDarkMode = document.documentElement.getAttribute('data-md-color-scheme') === 'slate';

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Distribute particles across a large area
            positions[i3] = (Math.random() - 0.5) * 150;      // x
            positions[i3 + 1] = (Math.random() - 0.5) * 100;  // y
            positions[i3 + 2] = (Math.random() - 0.5) * 80;   // z

            // Color gradient between primary and secondary
            const mixRatio = Math.random();
            const color = colorPrimary.clone().lerp(colorSecondary, mixRatio * 0.3);

            // Adjust brightness for theme
            if (isDarkMode) {
                color.multiplyScalar(0.8);
            } else {
                color.multiplyScalar(0.5);
            }

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Varied sizes for depth perception
            sizes[i] = Math.random() * this.config.particleSize + 0.5;

            // Random offset for animation variation
            randomness[i] = Math.random() * Math.PI * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 1));

        // Custom shader material for better performance and effects
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
                uOpacity: { value: isDarkMode ? 0.5 : 0.3 }
            },
            vertexShader: `
                attribute float size;
                attribute float aRandomness;
                
                uniform float uTime;
                uniform float uPixelRatio;
                
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // Gentle flowing motion
                    float flowX = sin(uTime * 0.1 + pos.y * 0.02 + aRandomness) * 2.0;
                    float flowY = cos(uTime * 0.08 + pos.x * 0.015 + aRandomness) * 1.5;
                    float flowZ = sin(uTime * 0.05 + pos.x * 0.01 + pos.y * 0.01) * 1.0;
                    
                    pos.x += flowX;
                    pos.y += flowY;
                    pos.z += flowZ;
                    
                    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    
                    gl_Position = projectedPosition;
                    
                    // Size attenuation based on distance
                    float sizeAttenuation = (1.0 / -viewPosition.z) * 100.0;
                    gl_PointSize = size * sizeAttenuation * uPixelRatio;
                    
                    // Fade based on depth
                    vOpacity = smoothstep(100.0, 20.0, -viewPosition.z);
                }
            `,
            fragmentShader: `
                uniform float uOpacity;
                
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    // Soft circular particles
                    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    
                    // Apply opacity
                    alpha *= uOpacity * vOpacity;
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    attachEventListeners() {
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleThemeChange = this.handleThemeChange.bind(this);

        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('mousemove', this.handleMouseMove, { passive: true });

        // Watch for theme changes - only if document element exists
        if (document.documentElement) {
            this.themeObserver = new MutationObserver(this.handleThemeChange);
            this.themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-md-color-scheme']
            });
        }
    }

    detachEventListeners() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);

        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
    }

    handleResize() {
        if (this.isDestroyed) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    handleMouseMove(event) {
        // Normalize mouse position to -1 to 1
        this.targetMousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    handleThemeChange() {
        const isDarkMode = document.documentElement.getAttribute('data-md-color-scheme') === 'slate';

        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.uOpacity.value = isDarkMode ? 0.5 : 0.3;
        }

        // Update particle colors
        this.updateParticleColors(isDarkMode);
    }

    updateParticleColors(isDarkMode) {
        if (!this.particles) return;

        const colors = this.particles.geometry.attributes.color;
        const colorPrimary = new THREE.Color(this.config.colorPrimary);
        const colorSecondary = new THREE.Color(this.config.colorSecondary);

        for (let i = 0; i < colors.count; i++) {
            const i3 = i * 3;

            const mixRatio = Math.random();
            const color = colorPrimary.clone().lerp(colorSecondary, mixRatio * 0.3);

            if (isDarkMode) {
                color.multiplyScalar(0.8);
            } else {
                color.multiplyScalar(0.5);
            }

            colors.array[i3] = color.r;
            colors.array[i3 + 1] = color.g;
            colors.array[i3 + 2] = color.b;
        }

        colors.needsUpdate = true;
    }

    startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;

            this.animationId = requestAnimationFrame(animate);

            const elapsedTime = this.clock.getElapsedTime();

            // Update shader uniforms
            if (this.particles && this.particles.material.uniforms) {
                this.particles.material.uniforms.uTime.value = elapsedTime;
            }

            // Smooth mouse following for camera
            this.mousePosition.x += (this.targetMousePosition.x - this.mousePosition.x) * 0.02;
            this.mousePosition.y += (this.targetMousePosition.y - this.mousePosition.y) * 0.02;

            // Subtle camera movement based on mouse
            this.camera.position.x = this.mousePosition.x * 5;
            this.camera.position.y = this.mousePosition.y * 3;
            this.camera.lookAt(0, 0, 0);

            // Very slow rotation of entire particle system
            if (this.particles) {
                this.particles.rotation.y = elapsedTime * 0.02;
                this.particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.1;
            }

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.detachEventListeners();

        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.scene.remove(this.particles);
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
    }
}
