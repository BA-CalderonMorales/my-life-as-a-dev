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
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        const isEmbedded = Boolean(this.container);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }
        this._updateCanvasPosition();
        window.addEventListener('resize', this._updateCanvasPosition.bind(this));
        window.addEventListener('scroll', this._updateCanvasPosition.bind(this));

        this._setupScene();
        this._createParticles();
        this._setupInteraction();
        this._startRenderLoop();
        window.addEventListener('resize', this._onResize.bind(this));
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
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            this.isInteracting = true;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersect = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.interactionPlane, intersect);
            if (intersect) this.mouse3D.copy(intersect);
        });
        this.container.addEventListener('mouseleave', () => { this.isInteracting = false; });
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
        if (this.renderer) this.renderer.dispose();
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }
}
