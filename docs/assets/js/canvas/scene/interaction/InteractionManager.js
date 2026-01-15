/**
 * Interaction Manager - Mouse, touch, keyboard, and raycasting
 * 
 * Handles all user input for the crystal cave scene including
 * orbit controls, crystal selection, particle attraction, and
 * full touch support for mobile/tablet devices.
 */
import * as THREE from 'three';

export class InteractionManager {
    constructor(container, camera, crystals, orbitCamera) {
        this.container = container;
        this.camera = camera;
        this.crystals = crystals;
        this.orbitCamera = orbitCamera;

        // Raycaster for picking
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.mouse3D = new THREE.Vector3();

        // Interaction state
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.focusedCrystal = null;
        this.hoveredCrystal = null;

        // Touch state
        this.isTouching = false;
        this.touchStartTime = 0;
        this.touchStartPosition = { x: 0, y: 0 };
        this.previousTouchPosition = { x: 0, y: 0 };
        this.pinchStartDistance = 0;
        this.isPinching = false;
        this.touchMoved = false;

        // Device detection
        this.isMobile = this._detectMobile();
        this.touchSensitivity = this.isMobile ? 0.008 : 0.005;

        // Bound handlers for cleanup
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseDown = this._handleMouseDown.bind(this);
        this._onMouseUp = this._handleMouseUp.bind(this);
        this._onMouseLeave = this._handleMouseLeave.bind(this);
        this._onWheel = this._handleWheel.bind(this);
        this._onKeyDown = this._handleKeyDown.bind(this);

        // Touch handlers
        this._onTouchStart = this._handleTouchStart.bind(this);
        this._onTouchMove = this._handleTouchMove.bind(this);
        this._onTouchEnd = this._handleTouchEnd.bind(this);
    }

    /**
     * Detect if device is mobile/tablet
     */
    _detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);
    }

    /**
     * Attach all event listeners
     */
    attach() {
        // Mouse events
        this.container.addEventListener('mousemove', this._onMouseMove);
        this.container.addEventListener('mousedown', this._onMouseDown);
        this.container.addEventListener('mouseup', this._onMouseUp);
        this.container.addEventListener('mouseleave', this._onMouseLeave);
        this.container.addEventListener('wheel', this._onWheel, { passive: false });
        window.addEventListener('keydown', this._onKeyDown);

        // Touch events
        this.container.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this.container.addEventListener('touchmove', this._onTouchMove, { passive: false });
        this.container.addEventListener('touchend', this._onTouchEnd, { passive: true });
        this.container.addEventListener('touchcancel', this._onTouchEnd, { passive: true });
    }

    /**
     * Remove all event listeners
     */
    detach() {
        // Mouse events
        this.container.removeEventListener('mousemove', this._onMouseMove);
        this.container.removeEventListener('mousedown', this._onMouseDown);
        this.container.removeEventListener('mouseup', this._onMouseUp);
        this.container.removeEventListener('mouseleave', this._onMouseLeave);
        this.container.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('keydown', this._onKeyDown);

        // Touch events
        this.container.removeEventListener('touchstart', this._onTouchStart);
        this.container.removeEventListener('touchmove', this._onTouchMove);
        this.container.removeEventListener('touchend', this._onTouchEnd);
        this.container.removeEventListener('touchcancel', this._onTouchEnd);
    }

    _handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();

        // Update normalized mouse coordinates
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Calculate 3D mouse position for particle attraction
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const planeZ = 0;
        const t = -this.camera.position.z / this.raycaster.ray.direction.z;
        if (t > 0) {
            this.mouse3D.copy(this.camera.position).add(
                this.raycaster.ray.direction.clone().multiplyScalar(t)
            );
        }

        // Handle drag orbit
        if (this.isDragging) {
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;

            this.orbitCamera.orbit(deltaX * 0.005, deltaY * 0.005);

            this.previousMousePosition.x = e.clientX;
            this.previousMousePosition.y = e.clientY;
        }

        // Update hovered crystal
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.crystals);
        this.hoveredCrystal = intersects.length > 0 ? intersects[0].object : null;
    }

    _handleMouseDown(e) {
        this.isDragging = true;
        this.previousMousePosition.x = e.clientX;
        this.previousMousePosition.y = e.clientY;
    }

    _handleMouseUp(e) {
        const wasDragging = this.isDragging && (
            Math.abs(e.clientX - this.previousMousePosition.x) > 5 ||
            Math.abs(e.clientY - this.previousMousePosition.y) > 5
        );
        this.isDragging = false;

        // Click to focus on crystal
        if (!wasDragging) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.crystals);

            if (intersects.length > 0) {
                const crystal = intersects[0].object;
                this.focusedCrystal = crystal;

                const crystalWorldPos = new THREE.Vector3();
                crystal.getWorldPosition(crystalWorldPos);
                this.orbitCamera.focusOn(crystalWorldPos, 5);
            }
        }
    }

    _handleMouseLeave() {
        this.isDragging = false;
        this.hoveredCrystal = null;
    }

    _handleWheel(e) {
        e.preventDefault();
        const zoomSpeed = 0.001;
        const delta = e.deltaY * zoomSpeed * this.orbitCamera.targetSpherical.radius;
        this.orbitCamera.zoom(delta);
    }

    _handleKeyDown(e) {
        const rotateSpeed = 0.05;

        switch (e.code) {
            case 'ArrowLeft':
                this.orbitCamera.orbit(-rotateSpeed, 0);
                break;
            case 'ArrowRight':
                this.orbitCamera.orbit(rotateSpeed, 0);
                break;
            case 'ArrowUp':
                this.orbitCamera.orbit(0, -rotateSpeed);
                break;
            case 'ArrowDown':
                this.orbitCamera.orbit(0, rotateSpeed);
                break;
            case 'Space':
                e.preventDefault();
                this.focusedCrystal = null;
                this.orbitCamera.reset();
                break;
        }
    }

    /**
     * Get mouse position in 3D for particle attraction
     */
    getMouse3D() {
        return this.mouse3D;
    }

    /**
     * Check if a crystal is hovered or focused
     */
    isCrystalActive(crystal) {
        return crystal === this.hoveredCrystal || crystal === this.focusedCrystal;
    }

    /**
     * Check if device is mobile/tablet
     */
    getIsMobile() {
        return this.isMobile;
    }

    // ========================
    // Touch Event Handlers
    // ========================

    /**
     * Calculate distance between two touch points
     */
    _getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get center point of two touches
     */
    _getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    _handleTouchStart(e) {
        e.preventDefault();

        if (e.touches.length === 1) {
            // Single touch - orbit or tap
            this.isTouching = true;
            this.touchMoved = false;
            this.touchStartTime = Date.now();
            this.touchStartPosition.x = e.touches[0].clientX;
            this.touchStartPosition.y = e.touches[0].clientY;
            this.previousTouchPosition.x = e.touches[0].clientX;
            this.previousTouchPosition.y = e.touches[0].clientY;

            // Update mouse for raycasting
            this._updateMouseFromTouch(e.touches[0]);

        } else if (e.touches.length === 2) {
            // Pinch to zoom
            this.isPinching = true;
            this.isTouching = false;
            this.pinchStartDistance = this._getTouchDistance(e.touches);
        }
    }

    _handleTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && this.isTouching) {
            // Single touch drag - orbit camera
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.previousTouchPosition.x;
            const deltaY = touch.clientY - this.previousTouchPosition.y;

            // Mark as moved if moved more than threshold
            const totalDeltaX = touch.clientX - this.touchStartPosition.x;
            const totalDeltaY = touch.clientY - this.touchStartPosition.y;
            if (Math.abs(totalDeltaX) > 10 || Math.abs(totalDeltaY) > 10) {
                this.touchMoved = true;
            }

            this.orbitCamera.orbit(deltaX * this.touchSensitivity, deltaY * this.touchSensitivity);

            this.previousTouchPosition.x = touch.clientX;
            this.previousTouchPosition.y = touch.clientY;

            // Update mouse for particle attraction
            this._updateMouseFromTouch(touch);

        } else if (e.touches.length === 2 && this.isPinching) {
            // Pinch zoom
            const currentDistance = this._getTouchDistance(e.touches);
            const delta = (this.pinchStartDistance - currentDistance) * 0.02;
            this.orbitCamera.zoom(delta);
            this.pinchStartDistance = currentDistance;

            // Update mouse to center of pinch
            const center = this._getTouchCenter(e.touches);
            this._updateMouseFromPosition(center.x, center.y);
        }
    }

    _handleTouchEnd(e) {
        // Check for tap (quick touch with no movement)
        if (this.isTouching && !this.touchMoved) {
            const touchDuration = Date.now() - this.touchStartTime;

            if (touchDuration < 300) {
                // Tap - try to select crystal
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.crystals);

                if (intersects.length > 0) {
                    const crystal = intersects[0].object;
                    this.focusedCrystal = crystal;

                    const crystalWorldPos = new THREE.Vector3();
                    crystal.getWorldPosition(crystalWorldPos);
                    this.orbitCamera.focusOn(crystalWorldPos, 5);
                } else {
                    // Tap on empty space - reset view
                    this.focusedCrystal = null;
                    this.orbitCamera.reset();
                }
            }
        }

        this.isTouching = false;
        this.isPinching = false;
        this.touchMoved = false;
    }

    /**
     * Update mouse coordinates from touch event
     */
    _updateMouseFromTouch(touch) {
        this._updateMouseFromPosition(touch.clientX, touch.clientY);
    }

    /**
     * Update mouse coordinates from x,y position
     */
    _updateMouseFromPosition(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();

        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        // Calculate 3D mouse position for particle attraction
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const planeZ = 0;
        const t = -this.camera.position.z / this.raycaster.ray.direction.z;
        if (t > 0) {
            this.mouse3D.copy(this.camera.position).add(
                this.raycaster.ray.direction.clone().multiplyScalar(t)
            );
        }
    }
}
