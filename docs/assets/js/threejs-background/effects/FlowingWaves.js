/**
 * FlowingWaves - Animated wave mesh for visual interest
 * 
 * Creates flowing, ribbon-like waves that move across the scene.
 * Bruno Simon-style organic movement with shader-based animation.
 * 
 * Domain: Effects (visual enhancements)
 * Pattern: Factory (creates multiple wave layers)
 */
import * as THREE from 'three';

export class FlowingWaves {
    constructor(options = {}) {
        this.waves = [];
        this.group = new THREE.Group();

        this.config = {
            waveCount: options.waveCount || 3,
            color: options.color || 0x26A69A,
            opacity: options.opacity || 0.4,
            amplitude: options.amplitude || 2.0,
            frequency: options.frequency || 0.5,
            speed: options.speed || 0.3,
            width: options.width || 200,
            height: options.height || 30,
        };
    }

    create() {
        for (let i = 0; i < this.config.waveCount; i++) {
            const wave = this.createWave(i);
            this.waves.push(wave);
            this.group.add(wave.mesh);
        }

        return this.group;
    }

    createWave(index) {
        const segments = 128;
        const geometry = new THREE.PlaneGeometry(this.config.width, this.config.height, segments, 32);

        // Offset each wave layer
        const layerOffset = index * 0.3;
        const layerDepth = -10 - index * 15;
        const layerOpacity = this.config.opacity * (1 - index * 0.25);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(this.config.color) },
                uOpacity: { value: layerOpacity },
                uAmplitude: { value: this.config.amplitude + index * 0.5 },
                uFrequency: { value: this.config.frequency + index * 0.1 },
                uSpeed: { value: this.config.speed + index * 0.05 },
                uOffset: { value: layerOffset },
            },
            vertexShader: `
                uniform float uTime;
                uniform float uAmplitude;
                uniform float uFrequency;
                uniform float uSpeed;
                uniform float uOffset;
                
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    vUv = uv;
                    
                    vec3 pos = position;
                    
                    // Multiple wave layers for complex motion
                    float wave1 = sin(pos.x * uFrequency * 0.1 + uTime * uSpeed + uOffset) * uAmplitude;
                    float wave2 = sin(pos.x * uFrequency * 0.2 + uTime * uSpeed * 0.7 + uOffset * 2.0) * uAmplitude * 0.5;
                    float wave3 = cos(pos.x * uFrequency * 0.05 + uTime * uSpeed * 0.3) * uAmplitude * 0.3;
                    
                    float elevation = wave1 + wave2 + wave3;
                    pos.z += elevation;
                    
                    // Slight y movement for flow effect
                    pos.y += sin(pos.x * 0.02 + uTime * 0.2) * 2.0;
                    
                    vElevation = elevation;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uOpacity;
                uniform float uTime;
                
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    // Fade edges for smooth blending
                    float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
                    float topFade = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
                    
                    // Color variation based on elevation
                    float colorShift = (vElevation + 3.0) / 6.0;
                    vec3 color = mix(uColor * 0.7, uColor * 1.3, colorShift);
                    
                    // Subtle shimmer
                    float shimmer = sin(vUv.x * 50.0 + uTime * 2.0) * 0.05 + 0.95;
                    
                    float alpha = uOpacity * edgeFade * topFade * shimmer;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = layerDepth;
        mesh.position.y = -20 + index * 5;
        mesh.rotation.x = -0.3;

        return { mesh, material };
    }

    update(time) {
        this.waves.forEach(wave => {
            if (wave.material && wave.material.uniforms) {
                wave.material.uniforms.uTime.value = time;
            }
        });
    }

    setColor(color) {
        const threeColor = new THREE.Color(color);
        this.waves.forEach(wave => {
            if (wave.material && wave.material.uniforms) {
                wave.material.uniforms.uColor.value = threeColor;
            }
        });
    }

    setOpacity(opacity) {
        this.waves.forEach((wave, index) => {
            if (wave.material && wave.material.uniforms) {
                wave.material.uniforms.uOpacity.value = opacity * (1 - index * 0.25);
            }
        });
    }

    dispose() {
        this.waves.forEach(wave => {
            wave.mesh.geometry.dispose();
            wave.material.dispose();
        });
        this.waves = [];
    }
}
