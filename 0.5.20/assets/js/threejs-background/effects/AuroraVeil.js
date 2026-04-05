/**
 * AuroraVeil - Slow moving aurora curtains for depth
 *
 * Creates translucent ribbon planes that drift in the background with
 * gentle parallax based on pointer movement. Designed to sit between the
 * gradient pass and the foreground particles so the content remains the
 * focal point.
 */
import * as THREE from 'three';

export class AuroraVeil {
    constructor(options = {}) {
        this.group = new THREE.Group();
        this.veils = [];

        this.config = {
            veilCount: options.veilCount || 1,
            color: options.color || 0xbcbab3,
            opacity: options.opacity ?? 0.08,
            speed: options.speed || 0.08,
            noiseScale: options.noiseScale || 0.08,
            sway: options.sway || 2.2,
            height: options.height || 140,
            width: options.width || 48,
            parallaxStrength: options.parallaxStrength || 1.3,
        };
    }

    create() {
        for (let i = 0; i < this.config.veilCount; i++) {
            const veil = this.createVeil(i);
            this.veils.push(veil);
            this.group.add(veil.mesh);
        }

        return this.group;
    }

    createVeil(index) {
        const geometry = new THREE.PlaneGeometry(
            this.config.width + index * 10,
            this.config.height,
            32,
            64
        );

        const positionOffset = (index - (this.config.veilCount - 1) / 2);
        const depth = -18 - index * 6;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(this.config.color) },
                uOpacity: { value: Math.max(this.config.opacity - index * 0.03, 0.03) },
                uSpeed: { value: this.config.speed + index * 0.03 },
                uNoiseScale: { value: this.config.noiseScale + index * 0.02 },
                uSway: { value: this.config.sway + index * 0.5 },
                uParallax: { value: new THREE.Vector2(0, 0) },
                uLayerOffset: { value: index * 1.2 },
            },
            vertexShader: `
                uniform float uTime;
                uniform float uNoiseScale;
                uniform float uSpeed;
                uniform float uSway;
                uniform vec2 uParallax;
                uniform float uLayerOffset;

                varying vec2 vUv;
                varying float vHeightGradient;

                // Simple 2D noise (value noise approximation)
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
                }

                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);

                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));

                    vec2 u = f * f * (3.0 - 2.0 * f);

                    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
                }

                void main() {
                    vUv = uv;
                    vHeightGradient = uv.y;

                    vec3 transformed = position;

                    float flow = noise(vec2(uv.y * uNoiseScale * 4.0, uTime * uSpeed + uLayerOffset));
                    float wave = sin((uv.y + uLayerOffset) * uNoiseScale * 12.0 + uTime * uSpeed * 2.0);

                    transformed.x += (flow - 0.5) * uSway;
                    transformed.x += wave * (uSway * 0.35);
                    transformed.z += cos((uv.y + uLayerOffset) * 1.5 + uTime * 0.4) * 1.2;

                    // Apply slight parallax shift from mouse input
                    transformed.x += uParallax.x;
                    transformed.y += uParallax.y * 0.5;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uOpacity;

                varying vec2 vUv;
                varying float vHeightGradient;

                void main() {
                    float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
                    float verticalFade = smoothstep(0.05, 0.5, vHeightGradient) * smoothstep(0.95, 0.6, vHeightGradient);

                    vec3 baseColor = mix(uColor * 0.82, uColor, vHeightGradient);
                    float alpha = uOpacity * edgeFade * verticalFade;

                    gl_FragColor = vec4(baseColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.NormalBlending,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = THREE.MathUtils.degToRad(-3 + positionOffset * 4);
        mesh.position.set(positionOffset * 12, -10 + index * 3, depth);

        return { mesh, material };
    }

    update(time, mouse = { x: 0, y: 0 }) {
        this.veils.forEach((veil, index) => {
            if (!veil.material || !veil.material.uniforms) return;

            veil.material.uniforms.uTime.value = time;

            // Subtle parallax following pointer location
            const parallaxX = mouse.x * this.config.parallaxStrength * (0.4 + index * 0.15);
            const parallaxY = mouse.y * this.config.parallaxStrength * 0.3;
            veil.material.uniforms.uParallax.value.set(parallaxX, parallaxY);
        });
    }

    setColor(color) {
        this.veils.forEach(veil => {
            if (veil.material?.uniforms?.uColor) {
                veil.material.uniforms.uColor.value = new THREE.Color(color);
            }
        });
    }

    setOpacity(opacity) {
        this.veils.forEach((veil, index) => {
            if (veil.material?.uniforms?.uOpacity) {
                veil.material.uniforms.uOpacity.value = Math.max(opacity - index * 0.03, 0.03);
            }
        });
    }

    dispose() {
        this.veils.forEach(veil => {
            veil.mesh.geometry.dispose();
            veil.material.dispose();
        });
        this.veils = [];
    }
}
