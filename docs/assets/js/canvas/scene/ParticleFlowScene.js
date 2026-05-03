import * as THREE from 'three';

export class ParticleFlowScene {
    constructor(containerId = 'canvas-scene') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isDestroyed = false;
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.mouse3D = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.isInteracting = false;
        this.isMobile = window.innerWidth < 768;
        this.isEmbedded = false;
        this.createdContainer = false;
        this.scrollVelocity = 0;
        this.lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        this.particles = null;
        this.particleVelocities = null;
        this.particleSeeds = null;

        this._handleResize = this._onResize.bind(this);
        this._handleCanvasPosition = this._updateCanvasPosition.bind(this);
        this._handleMouseMove = this._onPointerMove.bind(this);
        this._handleTouchMove = this._onTouchMove.bind(this);
        this._handleInteractionEnd = this._onInteractionEnd.bind(this);
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        this.isEmbedded = Boolean(this.container);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
            this.createdContainer = true;
        }
        this._updateCanvasPosition();
        window.addEventListener('resize', this._handleCanvasPosition);
        window.addEventListener('scroll', this._handleCanvasPosition);

        this._setupScene();
        this._createParticles();
        this._setupInteraction();
        this._startRenderLoop();
        window.addEventListener('resize', this._handleResize);
        return true;
    }

    _getColors() {
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
        return {
            background: isDark ? 0x0e0e0d : 0xefeee9,
            particle: isDark ? 0xb9b6af : 0x5f5f5a,
            accent: isDark ? 0xffffff : 0x1c1c1c,
        };
    }

    _setupScene() {
        const colors = this._getColors();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.background);
        this.scene.fog = new THREE.FogExp2(colors.background, 0.015);

        const fov = this.isMobile ? 60 : 50;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 18);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.container.appendChild(this.renderer.domElement);
    }

    _createParticles() {
        const colors = this._getColors();
        const count = this.isMobile ? 3600 : 9000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colorBuffer = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const seeds = new Float32Array(count * 3);

        const particleColor = new THREE.Color(colors.particle);
        const accentColor = new THREE.Color(colors.accent);

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const x = (Math.random() - 0.5) * 32;
            const y = (Math.random() - 0.5) * 18;
            const z = (Math.random() - 0.5) * 8;
            const mix = 0.12 + Math.random() * 0.28;
            const color = particleColor.clone().lerp(accentColor, mix);

            positions[idx] = x;
            positions[idx + 1] = y;
            positions[idx + 2] = z;
            colorBuffer[idx] = color.r;
            colorBuffer[idx + 1] = color.g;
            colorBuffer[idx + 2] = color.b;
            seeds[idx] = Math.random() * Math.PI * 2;
            seeds[idx + 1] = 0.45 + Math.random() * 0.85;
            seeds[idx + 2] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorBuffer, 3));

        const material = new THREE.PointsMaterial({
            size: this.isMobile ? 0.075 : 0.055,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.86,
            blending: THREE.NormalBlending,
            depthWrite: false,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        this.particleVelocities = velocities;
        this.particleSeeds = seeds;
    }

    _setupInteraction() {
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('mouseleave', this._handleInteractionEnd);
        this.container.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        this.container.addEventListener('touchend', this._handleInteractionEnd);
        this.container.addEventListener('touchcancel', this._handleInteractionEnd);
    }

    _onPointerMove(e) {
        this._setPointerPosition(e.clientX, e.clientY);
    }

    _onTouchMove(e) {
        if (!e.touches.length) return;
        e.preventDefault();
        this._setPointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    }

    _setPointerPosition(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.isInteracting = true;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersect = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.interactionPlane, intersect);
        if (intersect) this.mouse3D.copy(intersect);
    }

    _onInteractionEnd() {
        this.isInteracting = false;
    }

    _onResize() {
        this._updateCanvasPosition();
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    _updateCanvasPosition() {
        this._trackScrollVelocity();

        if (this.isEmbedded) {
            this.container.style.top = '';
            this.container.style.height = '';
            return;
        }
        const header = document.querySelector('.md-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const viewportHeight = Math.max(window.innerHeight - headerHeight, 0);
        document.documentElement.style.setProperty('--canvas-header-offset', `${headerHeight}px`);
        this.container.style.top = headerHeight + 'px';
        this.container.style.height = viewportHeight + 'px';
    }

    _trackScrollVelocity() {
        const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const delta = currentScrollY - this.lastScrollY;
        this.scrollVelocity += THREE.MathUtils.clamp(delta * 0.008, -1.2, 1.2);
        this.scrollVelocity = THREE.MathUtils.clamp(this.scrollVelocity, -2.4, 2.4);
        this.lastScrollY = currentScrollY;
    }

    _startRenderLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);

            const delta = Math.min(this.clock.getDelta(), 0.033);
            const elapsed = this.clock.elapsedTime;

            if (this.particles) {
                this._updateParticles(elapsed, delta);
            }

            this.camera.position.x = Math.sin(elapsed * 0.08) * 0.9;
            this.camera.position.y = Math.cos(elapsed * 0.06) * 0.55;
            this.camera.lookAt(0, 0, 0);

            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    _updateParticles(elapsed, delta) {
        const geometry = this.particles.geometry;
        const positions = geometry.attributes.position.array;
        const colorBuffer = geometry.attributes.color.array;
        const colors = this._getColors();
        const baseColor = new THREE.Color(colors.particle);
        const accentColor = new THREE.Color(colors.accent);
        const count = positions.length / 3;
        const step = delta * 60;
        const scrollKick = this.scrollVelocity;

        this.scrollVelocity *= 0.92;

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            let x = positions[idx];
            let y = positions[idx + 1];
            let z = positions[idx + 2];
            let vx = this.particleVelocities[idx];
            let vy = this.particleVelocities[idx + 1];
            let vz = this.particleVelocities[idx + 2];
            const phase = this.particleSeeds[idx];
            const speed = this.particleSeeds[idx + 1];

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
                const radiusSq = this.isMobile ? 20 : 28;

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

            x += vx * step;
            y += vy * step;
            z += vz * step;

            if (x > 16) x -= 32;
            if (x < -16) x += 32;
            if (y > 9) y -= 18;
            if (y < -9) y += 18;
            if (z > 5) z -= 10;
            if (z < -5) z += 10;

            positions[idx] = x;
            positions[idx + 1] = y;
            positions[idx + 2] = z;
            this.particleVelocities[idx] = vx;
            this.particleVelocities[idx + 1] = vy;
            this.particleVelocities[idx + 2] = vz;

            const speedMix = THREE.MathUtils.clamp(
                Math.sqrt(vx * vx + vy * vy + vz * vz) * 5.4 + pointerInfluence * 0.35,
                0,
                1
            );
            colorBuffer[idx] = THREE.MathUtils.lerp(baseColor.r, accentColor.r, speedMix);
            colorBuffer[idx + 1] = THREE.MathUtils.lerp(baseColor.g, accentColor.g, speedMix);
            colorBuffer[idx + 2] = THREE.MathUtils.lerp(baseColor.b, accentColor.b, speedMix);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        this.particles.rotation.z = Math.sin(elapsed * 0.1) * 0.035;
    }

    destroy() {
        this.isDestroyed = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);

        window.removeEventListener('resize', this._handleResize);
        window.removeEventListener('resize', this._handleCanvasPosition);
        window.removeEventListener('scroll', this._handleCanvasPosition);

        if (this.container) {
            this.container.removeEventListener('mousemove', this._handleMouseMove);
            this.container.removeEventListener('mouseleave', this._handleInteractionEnd);
            this.container.removeEventListener('touchmove', this._handleTouchMove);
            this.container.removeEventListener('touchend', this._handleInteractionEnd);
            this.container.removeEventListener('touchcancel', this._handleInteractionEnd);
        }

        if (this.scene) {
            this.scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach((material) => material.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }

        if (this.createdContainer && this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
