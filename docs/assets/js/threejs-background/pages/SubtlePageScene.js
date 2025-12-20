/**
 * SubtlePageScene - Subtle Three.js background for inner pages
 * Features minimal, centered geometric shapes that don't distract from content
 */
import { SceneManager } from '../core/SceneManager.js';
import { LightingManager } from '../lighting/LightingManager.js';
import { GeometryFactory } from '../animation/GeometryFactory.js';
import { AnimationController } from '../animation/AnimationController.js';
import { DeviceDetector } from '../utils/DeviceDetector.js';

export class SubtlePageScene {
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
        this.lightingManager.setupSubtleLighting();
        this.lightingManager.storeBaseIntensities();
    }

    createObjects() {
        const sphere1 = this.geometryFactory.createSphere({
            radius: 1.5,
            color: 0x26A69A,
            opacity: 0.25,
            position: { x: 0, y: 0, z: -8 }
        });
        this.addObject(sphere1, { scrollInfluence: 0.4 });

        const icosa1 = this.geometryFactory.createIcosahedron({
            radius: 1,
            color: 0x4DB6AC,
            opacity: 0.2,
            position: { x: -3, y: 2, z: -10 }
        });
        this.addObject(icosa1, { scrollInfluence: 0.3 });

        const octa1 = this.geometryFactory.createOctahedron({
            radius: 0.8,
            color: 0xFF8A65,
            opacity: 0.15,
            position: { x: 3, y: -1, z: -12 }
        });
        this.addObject(octa1, { scrollInfluence: 0.5 });

        const ring1 = this.geometryFactory.createWireframeRing({
            innerRadius: 4,
            outerRadius: 5,
            color: 0x26A69A,
            opacity: 0.06,
            position: { x: 0, y: 0, z: -15 }
        });
        this.addObject(ring1, { enableFloat: false, scrollInfluence: 0.2 });
    }

    addObject(object, animOptions = {}) {
        this.sceneManager.addToScene(object);
        this.animationController.registerObject(object, animOptions);
        this.objects.push(object);
    }

    setupUpdateLoop() {
        this.sceneManager.onUpdate((time, scrollProgress) => {
            this.animationController.update(time, scrollProgress);
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
