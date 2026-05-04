/**
 * Origami Unfolding ViewModel - Physics and Interaction
 */
import * as THREE from 'three';

export class ViewModel {
    constructor(view) {
        this.view = view;
        this.mouse3D = new THREE.Vector3(0, 0, 1);
        this.isInteracting = false;
        this.startTime = performance.now();
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    handleMouseMove(x, y) {
        this.isInteracting = true;
        this.raycaster.setFromCamera({ x, y }, this.view.camera);
        this.raycaster.ray.intersectPlane(this.plane, this.mouse3D);
    }

    handleInteractionEnd() {
        this.isInteracting = false;
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const dt = 0.016;

        // Interactive "folding"
        const cursorDir = this.mouse3D.clone().normalize();
        
        this.view.planes.forEach(plane => {
            const data = plane.userData;
            
            // Subtle self-rotation
            plane.rotateOnAxis(data.axis, data.rotationSpeed * dt * 0.1);
            
            let foldFactor = 0;
            if (this.isInteracting) {
                const dot = data.baseNormal.dot(cursorDir);
                if (dot > 0.2) foldFactor = (dot - 0.2) / 0.8;
            }
            
            const targetPos = data.basePos.clone().lerp(
                data.basePos.clone().multiplyScalar(0.5),
                foldFactor
            );
            plane.position.lerp(targetPos, 0.08);
        });

        // Update connections
        this.view.connections.forEach(line => {
            const { from, to } = line.userData;
            const pos = line.geometry.attributes.position.array;
            const p1 = this.view.planes[from].position;
            const p2 = this.view.planes[to].position;
            pos[0] = p1.x; pos[1] = p1.y; pos[2] = p1.z;
            pos[3] = p2.x; pos[4] = p2.y; pos[5] = p2.z;
            line.geometry.attributes.position.needsUpdate = true;
        });

        // Camera subtle orbit
        const cam = this.view.camera;
        const radius = 12;
        cam.position.x = Math.sin(elapsed * 0.2) * radius;
        cam.position.z = Math.cos(elapsed * 0.2) * radius;
        cam.position.y = Math.sin(elapsed * 0.1) * 2;
        cam.lookAt(0, 0, 0);

        this.view.render();
    }
}
