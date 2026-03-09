/**
 * HomePageScene - Prominent Three.js background for the landing page
 * Features multiple floating geometric shapes with toon-style rendering
 */
import { SceneManager } from '../core/SceneManager.js';
import { LightingManager } from '../lighting/LightingManager.js';
import { GeometryFactory } from '../animation/GeometryFactory.js';
import { AnimationController } from '../animation/AnimationController.js';
import { DeviceDetector } from '../utils/DeviceDetector.js';
import { HOME_SCENE_OBJECTS } from './SceneObjectModel.js';
import { buildSceneObject } from './SceneObjectViewModel.js';

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
        HOME_SCENE_OBJECTS.forEach((definition) => {
            const object = buildSceneObject(this.geometryFactory, definition);
            this.addObject(object, definition.animation);
        });
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
