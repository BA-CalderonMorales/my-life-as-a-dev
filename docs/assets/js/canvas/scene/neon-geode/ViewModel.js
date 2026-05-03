import * as THREE from 'three';

export class ViewModel {
    constructor(view, sparkleVelocities) {
        this.view = view;
        this.sparkleVelocities = sparkleVelocities;
        this.clock = new THREE.Clock();
    }

    update() {
        const elapsed = this.clock.getElapsedTime();
        this._updateCamera(elapsed);
        this._updateGeode(elapsed);
        this._updateLights(elapsed);
        this._updateSparkles();
        this.view.render();
    }

    _updateCamera(elapsed) {
        const camRadius = this.view.isMobile ? 10.5 : 10.2;
        this.view.camera.position.x = Math.sin(elapsed * 0.09) * camRadius;
        this.view.camera.position.y = 2.7 + Math.sin(elapsed * 0.18) * 0.45;
        this.view.camera.position.z = Math.cos(elapsed * 0.09) * camRadius;
        this.view.camera.lookAt(0, -0.35, 0);
    }

    _updateGeode(elapsed) {
        this.view.geodeGroup.rotation.y = elapsed * 0.035;
        this.view.core.rotation.x = elapsed * 0.28;
        this.view.core.rotation.y = elapsed * 0.42;
        
        const corePulse = 1 + Math.sin(elapsed * 2.6) * 0.055;
        this.view.core.scale.setScalar(corePulse);
        this.view.core.material.emissiveIntensity = 1.55 + Math.sin(elapsed * 3.2) * 0.34;

        this.view.crystals.forEach((crystal) => {
            const data = crystal.userData;
            const pulse = Math.sin(elapsed * data.pulseSpeed + data.pulseOffset);
            crystal.material.emissiveIntensity = data.baseEmissive + pulse * 0.28;
        });
    }

    _updateLights(elapsed) {
        this.view.lights.forEach((light, index) => {
            light.intensity = 2.2 + Math.sin(elapsed * (0.9 + index * 0.18)) * 0.45;
        });
    }

    _updateSparkles() {
        const positions = this.view.sparkles.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += this.sparkleVelocities[i] + Math.sin(positions[i + 1] * 0.7) * 0.0018;
            positions[i + 1] += this.sparkleVelocities[i + 1];
            positions[i + 2] += this.sparkleVelocities[i + 2] + Math.cos(positions[i + 1] * 0.6) * 0.0018;

            if (positions[i + 1] > 4.6) {
                positions[i + 1] = -1.6;
            }
        }

        this.view.sparkles.geometry.attributes.position.needsUpdate = true;
    }
}
