import * as THREE from 'three';
import { ZenGeometryScene } from './ZenGeometryScene.js';

export class StringTheoryScene extends ZenGeometryScene {
    constructor(containerId = 'canvas-scene') {
        super(containerId);
    }

    _createGeometry() {
        const colors = this._getColors();

        this.strings = [];

        const count = this.isMobile ? 120 : 200;
        const length = this.isMobile ? 18 : 24;

        for (let i = 0; i < count; i++) {
            const dir = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();

            const mid = dir.clone().multiplyScalar(length * 0.5 + Math.random() * 8);
            const half = dir.clone().multiplyScalar(length * 0.5);
            const p1 = mid.clone().sub(half);
            const p2 = mid.clone().add(half);

            const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            const mat = new THREE.LineBasicMaterial({
                color: colors.lineColor,
                transparent: true,
                opacity: 0.15,
            });
            const line = new THREE.Line(geo, mat);

            line.userData = {
                midpoint: mid.clone(),
                direction: dir.clone(),
                rotationAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
                rotationSpeed: 0.05 + Math.random() * 0.15,
                halfLength: length * 0.5,
                phase: Math.random() * Math.PI * 2,
            };

            this.scene.add(line);
            this.strings.push(line);
        }

        // Subtle fog
        const fogDensity = this.isMobile ? 0.018 : 0.014;
        this.scene.fog.density = fogDensity;
    }

    _updateTheme() {
        const colors = this._getColors();
        this.scene.background.setHex(colors.background);
        this.scene.fog.color.setHex(colors.fogColor);
        this.ambientLight.color.setHex(colors.ambientLight);

        this.strings.forEach(str => {
            str.material.color.setHex(colors.lineColor);
        });
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();

            // Fixed-distance camera orbit for tunnel effect
            const camDistance = this.camera.userData.baseDistance;
            const camSpeed = 0.012;
            const autoAngle = elapsed * camSpeed;
            const totalAngle = autoAngle + this.orbitAngle;
            let camX = Math.sin(totalAngle) * camDistance;
            let camZ = Math.cos(totalAngle) * camDistance;
            let camY = Math.sin(elapsed * camSpeed * 0.3) * 2 + this.orbitTilt * camDistance * 0.3;

            this.camera.position.set(camX, camY, camZ);
            this.camera.lookAt(0, 0, 0);

            // Slowly drift strings through space for wormhole feel
            const driftSpeed = 2.0;

            this.strings.forEach((str) => {
                const data = str.userData;
                const t = elapsed * data.rotationSpeed + data.phase;

                // Rotate around midpoint
                const rotQuat = new THREE.Quaternion().setFromAxisAngle(data.rotationAxis, t);
                const dir = data.direction.clone().applyQuaternion(rotQuat);

                // Drift midpoint toward camera plane to create passing effect
                const driftedMid = data.midpoint.clone();
                driftedMid.z += Math.sin(elapsed * 0.2 + data.phase) * 4;
                driftedMid.x += Math.cos(elapsed * 0.15 + data.phase) * 2;

                const half = dir.clone().multiplyScalar(data.halfLength);
                const p1 = driftedMid.clone().sub(half);
                const p2 = driftedMid.clone().add(half);

                const positions = str.geometry.attributes.position.array;
                positions[0] = p1.x;
                positions[1] = p1.y;
                positions[2] = p1.z;
                positions[3] = p2.x;
                positions[4] = p2.y;
                positions[5] = p2.z;
                str.geometry.attributes.position.needsUpdate = true;
            });

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }
}
