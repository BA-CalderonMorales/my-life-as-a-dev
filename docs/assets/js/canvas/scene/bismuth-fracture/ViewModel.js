import * as THREE from 'three';

export class ViewModel {
    constructor(view, stackConfigs) {
        this.view = view;
        this.stackConfigs = stackConfigs;
        this.clock = new THREE.Clock();

        this.matrix = new THREE.Matrix4();
        this.color = new THREE.Color();
        this.dummy = new THREE.Object3D();
    }

    update() {
        const elapsed = this.clock.getElapsedTime();
        this._updateCamera(elapsed);
        this._updateInstances(elapsed);
        this.view.render();
    }

    _updateCamera(elapsed) {
        const radius = 14;
        this.view.camera.position.x = Math.sin(elapsed * 0.07) * radius;
        this.view.camera.position.z = Math.cos(elapsed * 0.07) * radius;
        this.view.camera.lookAt(0, 1.5, 0);
    }

    _updateInstances(elapsed) {
        let instanceIdx = 0;
        this.stackConfigs.forEach((stack) => {
            stack.currentRot += stack.rotSpeed;

            for (let step = 0; step < stack.steps; step++) {
                const stepScale = 1.0 - (step / stack.steps) * 0.7;
                const w = stack.baseSize * stepScale;
                const h = 0.2; // Fixed height for simplicity in instance scaling
                const d = stack.baseSize * stepScale;

                this.dummy.scale.set(w, h, d);
                
                const angle = stack.angle;
                const dist = stack.dist;
                this.dummy.position.set(
                    Math.cos(angle) * dist,
                    -2 + step * 0.25,
                    Math.sin(angle) * dist
                );
                
                this.dummy.rotation.y = stack.currentRot + step * 0.15;
                this.dummy.updateMatrix();

                this.view.instancedMesh.setMatrixAt(instanceIdx, this.dummy.matrix);

                const hue = (stack.stackHue + step * 0.08) % 1.0;
                this.color.setHSL(hue, 0.8, 0.5);
                this.view.instancedMesh.setColorAt(instanceIdx, this.color);

                instanceIdx++;
            }
        });

        this.view.instancedMesh.instanceMatrix.needsUpdate = true;
        if (this.view.instancedMesh.instanceColor) {
            this.view.instancedMesh.instanceColor.needsUpdate = true;
        }
    }
}
