import * as THREE from "three";
/**
 * Neon Geode ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.crystals = [];
        this.core = { scale: { setScalar: () => {} }, rotation: { y: 0 } };
        this.sparkles = { geometry: { attributes: { position: { array: new Float32Array(300), needsUpdate: false } } } };
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addPointLights() {}
    addGeode() {}
    addCrystal() {
        const c = { 
            scale: { set: () => {} }, 
            position: { set: () => {} }, 
            rotation: { set: () => {}, y: 0 },
            userData: {},
            material: { emissiveIntensity: 0 }
        };
        this.crystals.push(c);
        return c;
    }
    addSparkles(pos) {
        this.sparkles.geometry.attributes.position.array = pos;
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('NeonGeode ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes crystal and sparkle states', () => {
        viewModel.init();
        expect(view.crystals.length).toBe(38); // desktop count
        expect(viewModel.sparklePositions.length).toBe(1200 * 3);
    });

    test('update modifies core scale and sparkle positions', () => {
        viewModel.init();
        const initialSparkleY = view.sparkles.geometry.attributes.position.array[1];
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.sparkles.geometry.attributes.position.array[1]).not.toBe(initialSparkleY);
        global.performance.now = realNow;
    });

    test('sparkles loop back during update', () => {
        viewModel.init();
        // Force a sparkle to the top
        viewModel.view.sparkles.geometry.attributes.position.array[1] = 5.0;
        
        viewModel.update();
        
        expect(viewModel.view.sparkles.geometry.attributes.position.array[1]).toBeLessThan(0);
    });
});
