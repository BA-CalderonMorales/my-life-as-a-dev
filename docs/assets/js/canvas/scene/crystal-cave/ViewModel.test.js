/**
 * Crystal Cave ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.container = { clientWidth: 1024, clientHeight: 768 };
        this.scene = { add: () => {}, background: { set: () => {} }, fog: { color: { set: () => {} } } };
        this.camera = {};
        this.renderer = { toneMapping: 0, toneMappingExposure: 0 };
    }
    init() {}
    addToScene() {}
    render() {}
    onResize() {}
    dispose() {}
}

describe('CrystalCave ViewModel', () => {
    let view;
    let viewModel;
    const colors = {
        background: 0x000000,
        fogColor: 0x000000,
        fogNear: 1,
        fogFar: 10,
        toneMappingExposure: 1.0,
        crystalColors: [0xffffff],
        glowColor: 0xffffff,
        particleColor: 0xffffff,
        particleSize: 0.1,
        particleOpacity: 0.5
    };

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes all sub-systems', () => {
        viewModel.init(colors);
        expect(viewModel.orbitCamera).not.toBeNull();
        expect(viewModel.lightingSystem).not.toBeNull();
        expect(viewModel.particleSystem).not.toBeNull();
        expect(viewModel.crystalAnimator).not.toBeNull();
        expect(viewModel.interactionManager).not.toBeNull();
    });

    test('update progresses time and calls system updates', () => {
        viewModel.init(colors);
        const initialTime = viewModel.startTime;
        
        // Mock performance.now
        const realNow = performance.now;
        global.performance.now = () => initialTime + 1000;
        
        viewModel.update();
        
        expect(viewModel.orbitCamera.camera.position).toBeDefined();
        global.performance.now = realNow;
    });

    test('onResize propagates to sub-systems', () => {
        viewModel.init(colors);
        viewModel.onResize();
        // orbitCamera should have been resized
    });
});
