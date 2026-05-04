/**
 * Radioactive Slag ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = { position: { x: 0 }, lookAt: () => {} };
        this.lights = [];
        this.rocks = [];
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addPointLight() {
        const l = { position: { set: () => {} }, intensity: 0 };
        this.lights.push(l);
        return l;
    }
    addRock() {
        const r = { 
            position: { set: () => {}, clone: () => ({ y: 0 }), y: 0 }, 
            rotation: { set: () => {}, x: 0, y: 0 },
            geometry: { attributes: { position: { count: 3, getX: () => 0, getY: () => 0, getZ: () => 0, setXYZ: () => {} } }, computeVertexNormals: () => {} },
            material: { emissiveIntensity: 0 }
        };
        this.rocks.push(r);
        return r;
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('RadioactiveSlag ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes lights and rocks', () => {
        viewModel.init();
        expect(view.lights.length).toBe(8); // RADIOACTIVE_CONFIG.desktop.lightCount
        expect(view.rocks.length).toBe(22); // RADIOACTIVE_CONFIG.desktop.rockCount
    });

    test('update modifies light intensities and rock properties', () => {
        viewModel.init();
        const initialIntensity = view.lights[0].intensity;
        const initialRockY = view.rocks[0].position.y;
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.lights[0].intensity).not.toBe(initialIntensity);
        expect(view.rocks[0].position.y).not.toBe(initialRockY);
        global.performance.now = realNow;
    });

    test('camera sway occurs during update', () => {
        viewModel.init();
        const initialCamX = view.camera.position.x;
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialCamX);
        global.performance.now = realNow;
    });
});
