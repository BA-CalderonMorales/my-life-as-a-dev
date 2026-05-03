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
        // Override in subclasses
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

    _startRenderLoop() {
        // Override in subclasses
        const animate = () => {
            if (this.isDestroyed) return;
            this.animationId = requestAnimationFrame(animate);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
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
