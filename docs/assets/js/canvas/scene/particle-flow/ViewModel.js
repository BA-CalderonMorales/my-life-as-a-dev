import * as THREE from 'three';

export class ViewModel {
    constructor(view, count, colors) {
        this.view = view;
        this.count = count;
        this.colors = colors;

        this.velocities = new Float32Array(count * 3);
        this.seeds = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            this.seeds[idx] = Math.random() * Math.PI * 2; // phase
            this.seeds[idx + 1] = 0.45 + Math.random() * 0.85; // speed
            this.seeds[idx + 2] = Math.random(); // variation
        }

        this.mouse = new THREE.Vector2(-1000, -1000);
        this.mouse3D = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.isInteracting = false;

        this.scrollVelocity = 0;
        this.lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        this.clock = new THREE.Clock();
    }

    update() {
        const delta = Math.min(this.clock.getDelta(), 0.033);
        const elapsed = this.clock.elapsedTime;
        this._trackScrollVelocity();

        const positions = this.view.particles.geometry.attributes.position.array;
        const colorBuffer = this.view.particles.geometry.attributes.color.array;
        const baseColor = new THREE.Color(this.colors.particle);
        const accentColor = new THREE.Color(this.colors.accent);

        const step = delta * 60;
        const scrollKick = this.scrollVelocity;
        this.scrollVelocity *= 0.92;

        for (let i = 0; i < this.count; i++) {
            const idx = i * 3;
            let vx = this.velocities[idx];
            let vy = this.velocities[idx + 1];
            let vz = this.velocities[idx + 2];
            const x = positions[idx];
            const y = positions[idx + 1];
            const z = positions[idx + 2];
            const phase = this.seeds[idx];
            const speed = this.seeds[idx + 1];

            const fieldX = Math.cos(y * 0.34 + elapsed * 0.55 + phase) * 0.018
                + Math.sin((y + z) * 0.18 + elapsed * 0.34) * 0.012;
            const fieldY = Math.sin(x * 0.28 - elapsed * 0.48 + phase) * 0.018
                + Math.cos((x - z) * 0.16 + elapsed * 0.24) * 0.011;
            const fieldZ = Math.sin((x + y) * 0.12 + elapsed * 0.35 + phase) * 0.012;

            vx += fieldX * speed;
            vy += (fieldY + scrollKick * 0.018) * speed;
            vz += fieldZ * speed;

            let pointerInfluence = 0;
            if (this.isInteracting) {
                const dx = x - this.mouse3D.x;
                const dy = y - this.mouse3D.y;
                const distSq = dx * dx + dy * dy;
                const radiusSq = this.view.isMobile ? 20 : 28;

                if (distSq < radiusSq) {
                    const dist = Math.sqrt(distSq) + 0.001;
                    pointerInfluence = 1 - dist / Math.sqrt(radiusSq);
                    const swirl = pointerInfluence * 0.12;
                    vx += (-dy / dist) * swirl;
                    vy += (dx / dist) * swirl;
                    vz += Math.sin(pointerInfluence * Math.PI) * 0.035;
                }
            }

            vx *= 0.925;
            vy *= 0.925;
            vz *= 0.92;

            positions[idx] = this._wrap(x + vx * step, 16);
            positions[idx + 1] = this._wrap(y + vy * step, 9);
            positions[idx + 2] = this._wrap(z + vz * step, 5);

            this.velocities[idx] = vx;
            this.velocities[idx + 1] = vy;
            this.velocities[idx + 2] = vz;

            const speedMix = THREE.MathUtils.clamp(
                Math.sqrt(vx * vx + vy * vy + vz * vz) * 5.4 + pointerInfluence * 0.35,
                0,
                1
            );
            colorBuffer[idx] = THREE.MathUtils.lerp(baseColor.r, accentColor.r, speedMix);
            colorBuffer[idx + 1] = THREE.MathUtils.lerp(baseColor.g, accentColor.g, speedMix);
            colorBuffer[idx + 2] = THREE.MathUtils.lerp(baseColor.b, accentColor.b, speedMix);
        }

        this.view.particles.geometry.attributes.position.needsUpdate = true;
        this.view.particles.geometry.attributes.color.needsUpdate = true;
        this.view.particles.rotation.z = Math.sin(elapsed * 0.1) * 0.035;

        this.view.camera.position.x = Math.sin(elapsed * 0.08) * 0.9;
        this.view.camera.position.y = Math.cos(elapsed * 0.06) * 0.55;
        this.view.camera.lookAt(0, 0, 0);

        this.view.render();
    }

    _wrap(val, range) {
        if (val > range) return val - range * 2;
        if (val < -range) return val + range * 2;
        return val;
    }

    _trackScrollVelocity() {
        const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const delta = currentScrollY - this.lastScrollY;
        this.scrollVelocity += THREE.MathUtils.clamp(delta * 0.008, -1.2, 1.2);
        this.scrollVelocity = THREE.MathUtils.clamp(this.scrollVelocity, -2.4, 2.4);
        this.lastScrollY = currentScrollY;
    }

    handleMouseMove(x, y) {
        this.mouse.set(x, y);
        this.isInteracting = true;
        this._updateMouse3D();
    }

    _updateMouse3D() {
        this.raycaster.setFromCamera(this.mouse, this.view.camera);
        this.raycaster.ray.intersectPlane(this.interactionPlane, this.mouse3D);
    }

    handleInteractionEnd() {
        this.isInteracting = false;
    }

    updateThemeColors(colors) {
        this.colors = colors;
    }
}
