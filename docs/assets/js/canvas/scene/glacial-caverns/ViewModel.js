import * as THREE from 'three';

export class ViewModel {
    constructor(view, blockConfigs) {
        this.view = view;
        this.blockConfigs = blockConfigs;
        this.clock = new THREE.Clock();

        this.matrix = new THREE.Matrix4();
        this.dummy = new THREE.Object3D();
    }

    update() {
        const elapsed = this.clock.getElapsedTime();
        this._updateCamera(elapsed);
        this._updateInstances(elapsed);
        this.view.render();
    }

    _updateCamera(elapsed) {
        this.view.camera.position.x = Math.sin(elapsed * 0.08) * 14;
        this.view.camera.position.z = Math.cos(elapsed * 0.08) * 14;
        this.view.camera.lookAt(0, 0, 0);
    }

    _updateInstances(elapsed) {
        this.blockConfigs.forEach((config, i) => {
            // Update rotation
            config.rot.x += config.rotSpeed.x * 0.01;
            config.rot.y += config.rotSpeed.y * 0.01;
            config.rot.z += config.rotSpeed.z * 0.01;

            // Update position (drift)
            const x = config.initialPos.x + Math.sin(elapsed * 0.2 + config.initialPos.z) * 0.5;
            const y = config.initialPos.y + Math.cos(elapsed * 0.15 + config.initialPos.x) * 0.4;
            const z = config.initialPos.z + Math.sin(elapsed * 0.25 + config.initialPos.y) * 0.5;

            this.dummy.position.set(x, y, z);
            this.dummy.rotation.copy(config.rot);
            this.dummy.scale.set(config.scale.x, config.scale.y, config.scale.z);
            this.dummy.updateMatrix();

            this.view.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        });

        this.view.instancedMesh.instanceMatrix.needsUpdate = true;
    }
}
