/**
 * GradientBackground - Animated gradient mesh for depth
 * 
 * Creates a full-screen gradient plane that subtly shifts colors,
 * providing visual depth behind other elements.
 * 
 * Domain: Effects (visual enhancements)
 * Pattern: Strategy (different gradient modes)
 */
import * as THREE from 'three';

export class GradientBackground {
    constructor(options = {}) {
        this.mesh = null;
        this.material = null;

        this.config = {
            colorTop: options.colorTop || new THREE.Color(0x1a1a2e),
            colorBottom: options.colorBottom || new THREE.Color(0x0f0f1a),
            colorAccent: options.colorAccent || new THREE.Color(0x26A69A),
            animationSpeed: options.animationSpeed || 0.3,
            waveIntensity: options.waveIntensity || 0.15,
        };
    }

    create() {
        const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColorTop: { value: this.config.colorTop },
                uColorBottom: { value: this.config.colorBottom },
                uColorAccent: { value: this.config.colorAccent },
                uWaveIntensity: { value: this.config.waveIntensity },
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColorTop;
                uniform vec3 uColorBottom;
                uniform vec3 uColorAccent;
                uniform float uWaveIntensity;
                
                varying vec2 vUv;
                
                // Simplex noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
                
                float snoise(vec2 v) {
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                       -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy));
                    vec2 x0 = v -   i + dot(i, C.xx);
                    vec2 i1;
                    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;
                    i = mod289(i);
                    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                           + i.x + vec3(0.0, i1.x, 1.0));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                           dot(x12.zw,x12.zw)), 0.0);
                    m = m*m;
                    m = m*m;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;
                    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                    vec3 g;
                    g.x = a0.x * x0.x + h.x * x0.y;
                    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }
                
                void main() {
                    // Base gradient
                    float gradientMix = vUv.y;
                    
                    // Add animated noise for subtle movement
                    float noise1 = snoise(vUv * 3.0 + uTime * 0.1) * uWaveIntensity;
                    float noise2 = snoise(vUv * 5.0 - uTime * 0.15) * uWaveIntensity * 0.5;
                    
                    gradientMix += noise1 + noise2;
                    gradientMix = clamp(gradientMix, 0.0, 1.0);
                    
                    // Mix base colors
                    vec3 color = mix(uColorBottom, uColorTop, gradientMix);
                    
                    // Add accent color glow in specific areas
                    float accentNoise = snoise(vUv * 2.0 + vec2(uTime * 0.05, 0.0));
                    float accentMask = smoothstep(0.3, 0.7, accentNoise) * 0.15;
                    color = mix(color, uColorAccent, accentMask);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            depthWrite: false,
            depthTest: false,
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.frustumCulled = false;
        this.mesh.renderOrder = -1000; // Render first (background)

        return this.mesh;
    }

    update(time) {
        if (this.material && this.material.uniforms) {
            this.material.uniforms.uTime.value = time;
        }
    }

    setColors(colorTop, colorBottom, colorAccent) {
        if (this.material && this.material.uniforms) {
            if (colorTop) this.material.uniforms.uColorTop.value = new THREE.Color(colorTop);
            if (colorBottom) this.material.uniforms.uColorBottom.value = new THREE.Color(colorBottom);
            if (colorAccent) this.material.uniforms.uColorAccent.value = new THREE.Color(colorAccent);
        }
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.material.dispose();
        }
    }
}
