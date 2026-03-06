/**
 * LightingManager - Lighting domain module for Three.js scene
 * Handles ambient, spot, and point lights with toon-style aesthetics
 */
import * as THREE from 'three';

export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = {
            ambient: null,
            spots: [],
            points: []
        };
    }

    /**
     * Setup ambient lighting for overall scene illumination
     */
    setupAmbientLight(options = {}) {
        const {
            color = 0x404050,
            intensity = 0.4
        } = options;

        this.lights.ambient = new THREE.AmbientLight(color, intensity);
        this.scene.add(this.lights.ambient);

        return this.lights.ambient;
    }

    /**
     * Add a spotlight for dramatic toon-style highlights
     */
    addSpotLight(options = {}) {
        const {
            color = 0xffffff,
            intensity = 1.0,
            position = { x: 0, y: 10, z: 10 },
            target = { x: 0, y: 0, z: 0 },
            angle = Math.PI / 6,
            penumbra = 0.3,
            distance = 100,
            castShadow = false
        } = options;

        const spotlight = new THREE.SpotLight(color, intensity);
        spotlight.position.set(position.x, position.y, position.z);
        spotlight.angle = angle;
        spotlight.penumbra = penumbra;
        spotlight.distance = distance;
        spotlight.castShadow = castShadow;

        spotlight.target.position.set(target.x, target.y, target.z);
        this.scene.add(spotlight.target);

        this.scene.add(spotlight);
        this.lights.spots.push(spotlight);

        return spotlight;
    }

    /**
     * Add a point light for soft omnidirectional lighting
     */
    addPointLight(options = {}) {
        const {
            color = 0xffffff,
            intensity = 0.8,
            position = { x: 0, y: 5, z: 5 },
            distance = 50,
            decay = 2
        } = options;

        const pointLight = new THREE.PointLight(color, intensity, distance, decay);
        pointLight.position.set(position.x, position.y, position.z);

        this.scene.add(pointLight);
        this.lights.points.push(pointLight);

        return pointLight;
    }

    /**
     * Create a preset lighting setup for home page (more dramatic)
     */
    setupHomePageLighting() {
        this.setupAmbientLight({
            color: 0xffffff,
            intensity: 0.56
        });

        this.addSpotLight({
            color: 0xffffff,
            intensity: 0.55,
            position: { x: -14, y: 18, z: 12 },
            penumbra: 0.45
        });

        this.addSpotLight({
            color: 0xb8b8b3,
            intensity: 0.34,
            position: { x: 16, y: 12, z: 10 },
            penumbra: 0.35
        });

        this.addPointLight({
            color: 0x7a7a75,
            intensity: 0.28,
            position: { x: 0, y: 10, z: 18 }
        });
    }

    /**
     * Create a preset lighting setup for inner pages (more subtle)
     */
    setupSubtleLighting() {
        this.setupAmbientLight({
            color: 0xffffff,
            intensity: 0.5
        });

        this.addPointLight({
            color: 0xffffff,
            intensity: 0.24,
            position: { x: 0, y: 8, z: 12 },
            distance: 40
        });

        this.addPointLight({
            color: 0x9a9a95,
            intensity: 0.16,
            position: { x: 5, y: 5, z: 8 },
            distance: 30
        });
    }

    /**
     * Update lighting based on scroll position
     */
    updateWithScroll(scrollProgress) {
        this.lights.spots.forEach((spot, index) => {
            if (spot.userData.baseIntensity === undefined) return;
            const offset = index * 0.5;
            const wave = Math.sin(scrollProgress * Math.PI * 2 + offset) * 0.08;
            spot.intensity = spot.userData.baseIntensity + wave;
        });
    }

    /**
     * Store base intensities for scroll-based updates
     */
    storeBaseIntensities() {
        this.lights.spots.forEach(spot => {
            spot.userData.baseIntensity = spot.intensity;
        });
        this.lights.points.forEach(point => {
            point.userData.baseIntensity = point.intensity;
        });
    }

    /**
     * Clean up all lights
     */
    dispose() {
        if (this.lights.ambient) {
            this.scene.remove(this.lights.ambient);
        }

        this.lights.spots.forEach(spot => {
            if (spot.target) this.scene.remove(spot.target);
            this.scene.remove(spot);
        });

        this.lights.points.forEach(point => {
            this.scene.remove(point);
        });

        this.lights = { ambient: null, spots: [], points: [] };
    }
}
