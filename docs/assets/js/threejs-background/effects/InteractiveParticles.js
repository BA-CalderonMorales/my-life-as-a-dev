/**
 * InteractiveParticles - Enhanced particle system with mouse interaction
 * 
 * Creates a constellation-style particle field that responds to mouse
 * movement with organic, Bruno Simon-inspired behavior. Particles connect
 * when close, creating a living network effect.
 * 
 * Domain: Effects (visual enhancements)
 * Pattern: Observer (mouse events), Strategy (different interaction modes)
 */
import * as THREE from 'three';

export class InteractiveParticles {
    constructor(options = {}) {
        this.group = new THREE.Group();
        this.particles = null;
        this.connections = null;

        this.config = {
            particleCount: options.particleCount || 200,
            particleSize: options.particleSize || 3,
            connectionDistance: options.connectionDistance || 15,
            mouseRadius: options.mouseRadius || 30,
            mouseStrength: options.mouseStrength || 0.3,
            colorPrimary: options.colorPrimary || 0x26A69A,
            colorSecondary: options.colorSecondary || 0xFF8A65,
            spread: options.spread || { x: 120, y: 80, z: 50 },
        };

        this.mouse = new THREE.Vector2(0, 0);
        this.mouse3D = new THREE.Vector3(0, 0, 20);
        this.targetMouse3D = new THREE.Vector3(0, 0, 20);

        // Store original positions for reset
        this.originalPositions = null;
        this.velocities = null;
    }

    create() {
        this.createParticles();
        this.createConnections();

        return this.group;
    }

    createParticles() {
        const count = this.config.particleCount;
        const geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const phases = new Float32Array(count);

        this.originalPositions = new Float32Array(count * 3);
        this.velocities = new Float32Array(count * 3);

        const colorPrimary = new THREE.Color(this.config.colorPrimary);
        const colorSecondary = new THREE.Color(this.config.colorSecondary);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Distribute particles in 3D space
            positions[i3] = (Math.random() - 0.5) * this.config.spread.x;
            positions[i3 + 1] = (Math.random() - 0.5) * this.config.spread.y;
            positions[i3 + 2] = (Math.random() - 0.5) * this.config.spread.z;

            // Store original positions
            this.originalPositions[i3] = positions[i3];
            this.originalPositions[i3 + 1] = positions[i3 + 1];
            this.originalPositions[i3 + 2] = positions[i3 + 2];

            // Initialize velocities
            this.velocities[i3] = 0;
            this.velocities[i3 + 1] = 0;
            this.velocities[i3 + 2] = 0;

            // Color gradient
            const mixRatio = Math.random();
            const color = colorPrimary.clone().lerp(colorSecondary, mixRatio * 0.4);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Varied sizes
            sizes[i] = this.config.particleSize * (0.5 + Math.random() * 1.0);

            // Random phase for animation
            phases[i] = Math.random() * Math.PI * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uMouse: { value: this.mouse3D },
                uMouseRadius: { value: this.config.mouseRadius },
            },
            vertexShader: `
                attribute float size;
                attribute float phase;
                
                uniform float uTime;
                uniform float uPixelRatio;
                uniform vec3 uMouse;
                uniform float uMouseRadius;
                
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // Gentle floating motion
                    pos.y += sin(uTime * 0.5 + phase) * 0.5;
                    pos.x += cos(uTime * 0.3 + phase * 0.5) * 0.3;
                    
                    // Mouse interaction - repulsion
                    vec3 toMouse = pos - uMouse;
                    float distToMouse = length(toMouse);
                    
                    if (distToMouse < uMouseRadius) {
                        float force = 1.0 - (distToMouse / uMouseRadius);
                        force = pow(force, 2.0); // Quadratic falloff
                        pos += normalize(toMouse) * force * 8.0;
                    }
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    
                    // Size attenuation
                    float sizeAttenuation = (300.0 / -mvPosition.z);
                    gl_PointSize = size * sizeAttenuation * uPixelRatio;
                    
                    // Distance fade
                    vAlpha = smoothstep(80.0, 20.0, -mvPosition.z);
                    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    // Soft circular particle with glow
                    float dist = length(gl_PointCoord - vec2(0.5));
                    
                    // Core
                    float core = 1.0 - smoothstep(0.0, 0.2, dist);
                    // Glow
                    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                    glow = pow(glow, 2.0);
                    
                    float alpha = (core * 0.8 + glow * 0.4) * vAlpha;
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
        });

        this.particles = new THREE.Points(geometry, material);
        this.group.add(this.particles);
    }

    createConnections() {
        // Pre-allocate connection lines geometry
        // Maximum possible connections (for performance, we limit this)
        const maxConnections = 500;
        const geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(maxConnections * 6); // 2 vertices per line, 3 coords each
        const colors = new Float32Array(maxConnections * 6);

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setDrawRange(0, 0);

        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        this.connections = new THREE.LineSegments(geometry, material);
        this.group.add(this.connections);
    }

    updateConnections() {
        if (!this.particles || !this.connections) return;

        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;
        const count = this.config.particleCount;
        const maxDist = this.config.connectionDistance;

        const connPositions = this.connections.geometry.attributes.position.array;
        const connColors = this.connections.geometry.attributes.color.array;

        let connectionIndex = 0;
        const maxConnections = 500;

        // Find nearby particles and create connections
        for (let i = 0; i < count && connectionIndex < maxConnections; i++) {
            const i3 = i * 3;
            const x1 = positions[i3];
            const y1 = positions[i3 + 1];
            const z1 = positions[i3 + 2];

            for (let j = i + 1; j < count && connectionIndex < maxConnections; j++) {
                const j3 = j * 3;
                const x2 = positions[j3];
                const y2 = positions[j3 + 1];
                const z2 = positions[j3 + 2];

                const dx = x2 - x1;
                const dy = y2 - y1;
                const dz = z2 - z1;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDist) {
                    const ci = connectionIndex * 6;

                    // Set positions
                    connPositions[ci] = x1;
                    connPositions[ci + 1] = y1;
                    connPositions[ci + 2] = z1;
                    connPositions[ci + 3] = x2;
                    connPositions[ci + 4] = y2;
                    connPositions[ci + 5] = z2;

                    // Set colors with distance-based alpha
                    const alpha = 1.0 - (dist / maxDist);
                    connColors[ci] = colors[i3] * alpha;
                    connColors[ci + 1] = colors[i3 + 1] * alpha;
                    connColors[ci + 2] = colors[i3 + 2] * alpha;
                    connColors[ci + 3] = colors[j3] * alpha;
                    connColors[ci + 4] = colors[j3 + 1] * alpha;
                    connColors[ci + 5] = colors[j3 + 2] * alpha;

                    connectionIndex++;
                }
            }
        }

        this.connections.geometry.attributes.position.needsUpdate = true;
        this.connections.geometry.attributes.color.needsUpdate = true;
        this.connections.geometry.setDrawRange(0, connectionIndex * 2);
    }

    updateMouse(normalizedX, normalizedY) {
        this.mouse.set(normalizedX, normalizedY);

        // Convert to 3D space
        this.targetMouse3D.set(
            normalizedX * 50,
            normalizedY * 30,
            20
        );
    }

    update(time) {
        // Smooth mouse following
        this.mouse3D.lerp(this.targetMouse3D, 0.1);

        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.uTime.value = time;
            this.particles.material.uniforms.uMouse.value = this.mouse3D;
        }

        // Update connections periodically (not every frame for performance)
        if (Math.floor(time * 10) % 2 === 0) {
            this.updateConnections();
        }
    }

    setColors(primary, secondary) {
        if (!this.particles) return;

        const colors = this.particles.geometry.attributes.color.array;
        const count = this.config.particleCount;
        const colorPrimary = new THREE.Color(primary);
        const colorSecondary = new THREE.Color(secondary);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const mixRatio = Math.random();
            const color = colorPrimary.clone().lerp(colorSecondary, mixRatio * 0.4);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        this.particles.geometry.attributes.color.needsUpdate = true;
    }

    dispose() {
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
        if (this.connections) {
            this.connections.geometry.dispose();
            this.connections.material.dispose();
        }
    }
}
