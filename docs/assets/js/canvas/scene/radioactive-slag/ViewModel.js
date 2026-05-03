import * as THREE from 'three';

export class ViewModel {
    constructor(view) {
        this.view = view;
        this.clock = new THREE.Clock();
    }

    update() {
        const elapsed = this.clock.getElapsedTime();
        this._updateCamera(elapsed);
        this._updateRocks(elapsed);
        this._updateLights(elapsed);
        this.view.render();
    }

    _updateCamera(elapsed) {
        const radius = 12;
        this.view.camera.position.x = Math.sin(elapsed * 0.09) * radius;
        this.view.camera.position.z = Math.cos(elapsed * 0.09) * radius;
        this.view.camera.lookAt(0, 0, 0);
    }

    _updateRocks(elapsed) {
        this.view.rocks.forEach((rock) => {
            const ud = rock.userData;
            const pulse = Math.sin(elapsed * ud.pulseSpeed + ud.pulseOffset);
            rock.material.emissiveIntensity = 3.0 + pulse * 2.0;

            rock.rotation.x += ud.rotSpeed.x * 0.01;
            rock.rotation.y += ud.rotSpeed.y * 0.01;
        });
    }

    _updateLights(elapsed) {
        this.view.lights.forEach((light) => {
            const ud = light.userData;
            const flicker = Math.sin(elapsed * ud.flickerSpeed + ud.flickerOffset);
            light.intensity = ud.baseIntensity + flicker * 0.8;
        });
    }
}
