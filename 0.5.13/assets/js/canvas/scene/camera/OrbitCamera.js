/**
 * Orbit Camera - Smooth spherical camera controls
 * 
 * Provides orbit, zoom, and focus functionality with
 * smooth interpolation for cinematic camera movement.
 * Includes mobile-optimized defaults.
 */
import * as THREE from 'three';

export class OrbitCamera {
    constructor(options = {}) {
        this.camera = null;

        // Detect mobile for adjusted defaults
        this.isMobile = this._detectMobile();

        // Mobile gets closer camera for better crystal visibility
        const defaultRadius = this.isMobile ? 8 : (options.radius || 10);
        const minRadius = this.isMobile ? 3 : (options.minRadius || 4);
        const maxRadius = this.isMobile ? 15 : (options.maxRadius || 20);

        // Orbit state
        this.spherical = new THREE.Spherical(
            defaultRadius,
            options.phi || Math.PI / 2,
            options.theta || 0
        );
        this.targetSpherical = new THREE.Spherical(
            defaultRadius,
            options.phi || Math.PI / 2,
            options.theta || 0
        );

        // Look-at target
        this.target = new THREE.Vector3(0, 0, 0);
        this.targetTarget = new THREE.Vector3(0, 0, 0);

        // Constraints
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.defaultRadius = defaultRadius;
        this.minPhi = options.minPhi || 0.3;
        this.maxPhi = options.maxPhi || Math.PI - 0.3;

        // Smoothing - slightly faster on mobile for responsiveness
        this.smoothing = this.isMobile ? 0.08 : (options.smoothing || 0.05);

        // Auto rotation - slower on mobile
        this.autoRotate = true;
        this.autoRotateSpeed = this.isMobile ? 0.06 : (options.autoRotateSpeed || 0.1);
    }

    /**
     * Detect if device is mobile/tablet
     */
    _detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (typeof window !== 'undefined' && 'ontouchstart' in window) ||
            (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    }

    /**
     * Create the perspective camera
     */
    create(aspectRatio) {
        this.camera = new THREE.PerspectiveCamera(65, aspectRatio, 0.1, 1000);
        this.updatePosition();
        return this.camera;
    }

    /**
     * Update camera position from spherical coordinates
     */
    updatePosition() {
        this.camera.position.setFromSpherical(this.spherical);
        this.camera.position.add(this.target);
        this.camera.lookAt(this.target);
    }

    /**
     * Smooth update called each frame
     * @param {number} elapsed - Time elapsed for auto-rotation
     */
    update(elapsed) {
        // Auto-rotate
        if (this.autoRotate) {
            this.targetSpherical.theta = elapsed * this.autoRotateSpeed;
        }

        // Smooth interpolation
        this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * this.smoothing;
        this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * this.smoothing;
        this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * this.smoothing;
        this.target.lerp(this.targetTarget, this.smoothing);

        this.updatePosition();
    }

    /**
     * Orbit by delta amounts (for drag)
     */
    orbit(deltaTheta, deltaPhi) {
        this.autoRotate = false;
        this.targetSpherical.theta -= deltaTheta;
        this.targetSpherical.phi = Math.max(
            this.minPhi,
            Math.min(this.maxPhi, this.targetSpherical.phi + deltaPhi)
        );
    }

    /**
     * Zoom by delta (for scroll)
     */
    zoom(delta) {
        this.targetSpherical.radius = Math.max(
            this.minRadius,
            Math.min(this.maxRadius, this.targetSpherical.radius + delta)
        );
    }

    /**
     * Focus on a specific point
     */
    focusOn(position, radius = 5) {
        this.autoRotate = false;
        this.targetTarget.copy(position);
        this.targetSpherical.radius = radius;
    }

    /**
     * Reset to default view
     */
    reset() {
        this.autoRotate = true;
        this.targetTarget.set(0, 0, 0);
        this.targetSpherical.radius = this.defaultRadius;
        this.targetSpherical.phi = Math.PI / 2;
    }

    /**
     * Handle window resize
     */
    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
