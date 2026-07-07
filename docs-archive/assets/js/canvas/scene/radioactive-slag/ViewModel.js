/**
 * Radioactive Slag ViewModel - Core Behavioral Logic
 * 
 * Orchestrates light flickering, rock pulsing, and floating physics.
 */
import * as THREE from 'three';
import { RADIOACTIVE_CONFIG } from './Model.js';

export class ViewModel {
    constructor(view, isMobile) {
        this.view = view;
        this.config = RADIOACTIVE_CONFIG;
        this.isMobile = isMobile;

        this.startTime = performance.now();
        this.lightStates = [];
        this.rockStates = [];
    }

    init() {
        const perf = this.isMobile ? this.config.mobile : this.config.desktop;
        const colors = this.config.colors;

        this.view.init(colors);

        // Behavior: Generate randomized point light states
        for (let i = 0; i < perf.lightCount; i++) {
            const light = this.view.addPointLight(colors.glow);
            const angle = Math.random() * Math.PI * 2;
            const dist = 4 + Math.random() * 6;
            light.position.set(
                Math.cos(angle) * dist,
                (Math.random() - 0.5) * 6,
                Math.sin(angle) * dist
            );

            this.lightStates.push({
                flickerSpeed: this.config.physics.flickerSpeedRange[0] + Math.random() * (this.config.physics.flickerSpeedRange[1] - this.config.physics.flickerSpeedRange[0]),
                flickerOffset: Math.random() * Math.PI * 2,
                baseIntensity: this.config.physics.baseIntensityRange[0] + Math.random() * (this.config.physics.baseIntensityRange[1] - this.config.physics.baseIntensityRange[0]),
            });
        }

        // Behavior: Generate randomized rock states and geometries
        for (let i = 0; i < perf.rockCount; i++) {
            const radius = 0.4 + Math.random() * 0.8;
            const rock = this.view.addRock(radius, colors);

            // Jitter rock vertices (Behavioral Aesthetics)
            const posAttr = rock.geometry.attributes.position;
            for (let v = 0; v < posAttr.count; v++) {
                posAttr.setXYZ(v,
                    posAttr.getX(v) + (Math.random() - 0.5) * radius * 0.4,
                    posAttr.getY(v) + (Math.random() - 0.5) * radius * 0.4,
                    posAttr.getZ(v) + (Math.random() - 0.5) * radius * 0.4
                );
            }
            rock.geometry.computeVertexNormals();

            const angle = Math.random() * Math.PI * 2;
            const dist = 1.5 + Math.random() * 5;
            rock.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 5, Math.sin(angle) * dist);
            rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            this.rockStates.push({
                initialPos: rock.position.clone(),
                pulseSpeed: this.config.physics.pulseSpeedRange[0] + Math.random() * (this.config.physics.pulseSpeedRange[1] - this.config.physics.pulseSpeedRange[0]),
                pulseOffset: Math.random() * Math.PI * 2,
                rotSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * this.config.physics.rotSpeedMax,
                    (Math.random() - 0.5) * this.config.physics.rotSpeedMax,
                    0
                )
            });
        }
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const dt = 0.016;

        // Behavior: Flicker lights
        this.view.lights.forEach((light, i) => {
            const state = this.lightStates[i];
            light.intensity = state.baseIntensity + Math.sin(elapsed * state.flickerSpeed + state.flickerOffset) * 0.5;
        });

        // Behavior: Pulse and rotate rocks
        this.view.rocks.forEach((rock, i) => {
            const state = this.rockStates[i];
            
            // Floating movement
            rock.position.y = state.initialPos.y + Math.sin(elapsed * state.pulseSpeed + state.pulseOffset) * 0.2;
            
            // Rotation
            rock.rotation.x += state.rotSpeed.x * dt;
            rock.rotation.y += state.rotSpeed.y * dt;

            // Emissive pulse
            rock.material.emissiveIntensity = 0.5 + Math.sin(elapsed * state.pulseSpeed + state.pulseOffset) * 0.5;
        });

        // Behavior: Gentle camera sway
        this.view.camera.position.x = Math.sin(elapsed * 0.2) * 2;
        this.view.camera.lookAt(0, 0, 0);

        this.view.render();
    }

    onResize() {
        this.view.onResize();
    }

    dispose() {
        this.view.dispose();
    }
}
