/**
 * SceneManager - Core domain module for Three.js scene lifecycle
 * Follows MVVM pattern: Scene state (Model), Renderer (View), SceneManager (ViewModel)
 */
import * as THREE from 'three';

export class SceneManager {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.isInitialized = false;
        this.isDestroyed = false;

        this.options = {
            antialias: true,
            alpha: true,
            powerPreference: options.powerPreference || 'low-power',
            ...options
        };

        this.resizeHandler = this.handleResize.bind(this);
        this.scrollHandler = this.handleScroll.bind(this);
        this.scrollProgress = 0;

        this.onUpdateCallbacks = [];
        this.onScrollCallbacks = [];
    }

    async init() {
        if (this.isInitialized || this.isDestroyed) return false;

        try {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                return false;
            }

            await this.setupScene();
            await this.setupCamera();
            await this.setupRenderer();

            this.attachEventListeners();
            this.isInitialized = true;

            return true;
        } catch {
            return false;
        }
    }

    async setupScene() {
        this.scene = new THREE.Scene();
    }

    getViewportSize() {
        return {
            width: this.container?.clientWidth || window.innerWidth || document.documentElement.clientWidth || 1,
            height: this.container?.clientHeight || window.innerHeight || document.documentElement.clientHeight || 1
        };
    }

    async setupCamera() {
        const { width, height } = this.getViewportSize();
        const aspect = width / height;

        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.z = 30;
    }

    async setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.options.antialias,
            alpha: this.options.alpha,
            powerPreference: this.options.powerPreference
        });
        this.renderer.setClearColor(0x000000, 0);

        const pixelRatio = this.options.pixelRatio || Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        this.updateRendererSize();

        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.pointerEvents = 'none';

        this.container.appendChild(this.renderer.domElement);
        requestAnimationFrame(() => this.handleResize());
    }

    updateRendererSize() {
        const { width, height } = this.getViewportSize();
        this.renderer.setSize(width, height);

        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    attachEventListeners() {
        window.addEventListener('resize', this.resizeHandler, { passive: true });
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    detachEventListeners() {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('scroll', this.scrollHandler);
    }

    handleResize() {
        if (!this.isInitialized || this.isDestroyed) return;
        this.updateRendererSize();
    }

    handleScroll() {
        if (!this.isInitialized || this.isDestroyed) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        this.scrollProgress = Math.min(scrollTop / docHeight, 1);

        this.onScrollCallbacks.forEach(cb => cb(this.scrollProgress, scrollTop));
    }

    onUpdate(callback) {
        if (typeof callback === 'function') {
            this.onUpdateCallbacks.push(callback);
        }
    }

    onScroll(callback) {
        if (typeof callback === 'function') {
            this.onScrollCallbacks.push(callback);
        }
    }

    startRenderLoop() {
        if (!this.isInitialized || this.isDestroyed) return;

        const animate = (time) => {
            if (this.isDestroyed) return;

            this.animationId = requestAnimationFrame(animate);

            const deltaTime = time * 0.001;
            this.onUpdateCallbacks.forEach(cb => cb(deltaTime, this.scrollProgress));

            this.renderer.render(this.scene, this.camera);
        };

        animate(0);
    }

    stopRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    addToScene(object) {
        if (this.scene && object) {
            this.scene.add(object);
        }
    }

    removeFromScene(object) {
        if (this.scene && object) {
            this.scene.remove(object);
        }
    }

    destroy() {
        if (this.isDestroyed) return;

        this.isDestroyed = true;
        this.stopRenderLoop();
        this.detachEventListeners();

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }

        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.container = null;
        this.onUpdateCallbacks = [];
        this.onScrollCallbacks = [];
    }
}
