import * as THREE from 'three';

export class ViewModel {
    constructor(view, shardConfigs) {
        this.view = view;
        this.shardConfigs = shardConfigs;
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
        const radius = 16;
        this.view.camera.position.x = Math.sin(elapsed * 0.06) * radius;
        this.view.camera.position.z = Math.cos(elapsed * 0.06) * radius;
        this.view.camera.lookAt(0, 0, 0);
    }

    _updateInstances(elapsed) {
        this.shardConfigs.forEach((config, i) => {
            // Update rotation
            config.rot.x += config.rotSpeed.x * 0.01;
            config.rot.y += config.rotSpeed.y * 0.01;
            config.rot.z += config.rotSpeed.z * 0.01;

            // Update position (float)
            const y = config.initialPos.y + Math.sin(elapsed * config.floatSpeed + config.floatOffset) * 0.5;

            this.dummy.position.set(config.initialPos.x, y, config.initialPos.z);
            this.dummy.rotation.copy(config.rot);
            this.dummy.scale.set(config.scale.w, config.scale.h, config.scale.d);
            this.dummy.updateMatrix();

            this.view.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        });

        this.view.instancedMesh.instanceMatrix.needsUpdate = true;
    }
}
