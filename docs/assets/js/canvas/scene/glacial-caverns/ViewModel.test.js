/**
 * Glacial Caverns ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getColors } from './Model.js';
import * as THREE from 'three';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.instancedMesh = { 
            instanceMatrix: { needsUpdate: false }, 
            setMatrixAt: () => {},
            setColorAt: () => {}
        };
        this.container = { clientWidth: 1024, clientHeight: 768 };
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

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('is console-clean', () => {
        const errorSpy = vi.spyOn(console, 'error');
        const warnSpy = vi.spyOn(console, 'warn');
        
        const colors = getColors();
        viewModel.init(colors);
        viewModel.update();
        
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('initializes block configurations through passive view', () => {
        const colors = getColors();
        viewModel.init(colors);
        expect(viewModel.blockConfigs.length).toBe(30); 
    });

    test('update modifies block matrices and camera', () => {
        const colors = getColors();
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
        const colors = getColors();
        viewModel.init(colors);
        viewModel.onResize();
    });
});
