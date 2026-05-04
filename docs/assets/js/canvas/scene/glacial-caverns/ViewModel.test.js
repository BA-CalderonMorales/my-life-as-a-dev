import * as THREE from "three";
/**
 * Glacial Caverns ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.instancedMesh = { 
            instanceMatrix: { needsUpdate: false }, 
            setMatrixAt: () => {},
            setColorAt: () => {}
        };
    }
    init() {}
    addPointLights() {}
    addInstancedBlocks() {}
    render() {}
    onResize() {}
    dispose() {}
}

describe('GlacialCaverns ViewModel', () => {
    let view;
    let viewModel;
    const colors = {
        background: 0x000000,
        light: 0xffffff,
        ice: [0xffffff],
        ambient: 0x111111
    };

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes block configurations through passive view', () => {
        viewModel.init(colors);
        expect(viewModel.blockConfigs.length).toBe(30); // GLACIAL_CONFIG.desktop.blockCount
    });

    test('update modifies block matrices and camera', () => {
        viewModel.init(colors);
        const initialY = view.camera.position.y;
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.y).not.toBe(initialY);
        expect(view.instancedMesh.instanceMatrix.needsUpdate).toBe(true);
        global.performance.now = realNow;
    });

    test('onResize propagates correctly', () => {
        viewModel.init(colors);
        viewModel.onResize();
    });
});
