/**
 * HomePageScene - Prominent Three.js background for the landing page
 * Features multiple floating geometric shapes with toon-style rendering
 */
import { SceneManager } from '../core/SceneManager.js';
import { LightingManager } from '../lighting/LightingManager.js';
import { GeometryFactory } from '../animation/GeometryFactory.js';
import { AnimationController } from '../animation/AnimationController.js';
import { DeviceDetector } from '../utils/DeviceDetector.js';

export class HomePageScene {
    constructor(containerId = 'threejs-bg-container') {
        this.containerId = containerId;
        this.sceneManager = null;
        this.lightingManager = null;
        this.geometryFactory = null;
        this.animationController = null;
        this.deviceDetector = new DeviceDetector();
        this.objects = [];
    }

    async init() {
        const qualitySettings = this.deviceDetector.getQualitySettings();
        this.sceneManager = new SceneManager(this.containerId, {
            antialias: qualitySettings.antialias,
            pixelRatio: this.deviceDetector.getOptimalPixelRatio()
        });
        const success = await this.sceneManager.init();

        if (!success) {
            return false;
        }

        this.geometryFactory = new GeometryFactory();
        this.lightingManager = new LightingManager(this.sceneManager.scene);
        this.animationController = new AnimationController();

        this.setupLighting();
        this.createObjects();
        this.setupUpdateLoop();

        this.sceneManager.startRenderLoop();

        return true;
    }

    setupLighting() {
        this.lightingManager.setupHomePageLighting();
        this.lightingManager.storeBaseIntensities();
    }

    createObjects() {
        const sphere1 = this.geometryFactory.createSphere({
            radius: 2,
            color: 0x26A69A,
            opacity: 0.5,
            position: { x: -8, y: 3, z: -5 }
        });
        this.addObject(sphere1, { scrollInfluence: 0.8 });

        const sphere2 = this.geometryFactory.createSphere({
            radius: 1.2,
            color: 0x4DB6AC,
            opacity: 0.4,
            position: { x: 10, y: -2, z: -8 }
        });
        this.addObject(sphere2, { scrollInfluence: 1.2 });

        const icosa1 = this.geometryFactory.createIcosahedron({
            radius: 1.8,
            color: 0xFF8A65,
            opacity: 0.45,
            position: { x: 6, y: 5, z: -3 }
        });
        this.addObject(icosa1, { scrollInfluence: 1.0 });

        const icosa2 = this.geometryFactory.createIcosahedron({
            radius: 1,
            color: 0xFF7043,
            opacity: 0.35,
            position: { x: -12, y: -4, z: -10 }
        });
        this.addObject(icosa2, { scrollInfluence: 1.5 });

        const torus1 = this.geometryFactory.createTorus({
            radius: 2.5,
            tube: 0.4,
            color: 0x00796B,
            opacity: 0.35,
            position: { x: 0, y: 8, z: -12 }
        });
        this.addObject(torus1, { scrollInfluence: 0.6 });

        const torus2 = this.geometryFactory.createTorus({
            radius: 1.5,
            tube: 0.25,
            color: 0x26A69A,
            opacity: 0.3,
            position: { x: -5, y: -6, z: -7 }
        });
        this.addObject(torus2, { scrollInfluence: 0.9 });

        const octa1 = this.geometryFactory.createOctahedron({
            radius: 1.5,
            color: 0x4DB6AC,
            opacity: 0.4,
            position: { x: 12, y: 2, z: -6 }
        });
        this.addObject(octa1, { scrollInfluence: 1.1 });

        const octa2 = this.geometryFactory.createOctahedron({
            radius: 0.8,
            color: 0xFF8A65,
            opacity: 0.35,
            position: { x: -3, y: 6, z: -4 }
        });
        this.addObject(octa2, { scrollInfluence: 0.7 });

        const ring1 = this.geometryFactory.createWireframeRing({
            innerRadius: 8,
            outerRadius: 10,
            color: 0x26A69A,
            opacity: 0.1,
            position: { x: 0, y: 0, z: -20 }
        });
        this.addObject(ring1, { enableFloat: false, scrollInfluence: 0.3 });

        const ring2 = this.geometryFactory.createWireframeRing({
            innerRadius: 12,
            outerRadius: 15,
            color: 0x4DB6AC,
            opacity: 0.08,
            position: { x: 5, y: -3, z: -25 }
        });
        this.addObject(ring2, { enableFloat: false, scrollInfluence: 0.2 });
    }

    addObject(object, animOptions = {}) {
        this.sceneManager.addToScene(object);
        this.animationController.registerObject(object, animOptions);
        this.objects.push(object);
    }

    setupUpdateLoop() {
        this.sceneManager.onUpdate((time, scrollProgress) => {
            this.animationController.update(time, scrollProgress);
            this.lightingManager.updateWithScroll(scrollProgress);
        });
    }

    destroy() {
        this.animationController?.clear();
        this.lightingManager?.dispose();
        this.geometryFactory?.dispose();
        this.sceneManager?.destroy();

        this.objects = [];
    }
}
