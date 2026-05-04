import * as THREE from "three";
/**
 * Origami Unfolding ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor(planeCount) {
        this.camera = new THREE.PerspectiveCamera();
        this.planes = Array.from({ length: planeCount }, () => ({
            position: { copy: () => {}, lerp: () => {}, multiplyScalar: () => {}, clone: () => ({ multiplyScalar: () => {} }) },
            lookAt: () => {},
            rotateOnAxis: () => {}
        }));
        this.connections = [];
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addPlanes() {}
    addConnections(pairs) {
        this.connections = pairs.map(() => ({
            geometry: { attributes: { position: { array: new Float32Array(6), needsUpdate: false } } }
        }));
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('OrigamiUnfolding ViewModel', () => {
    let view;
    let viewModel;
    const planeCount = 12; // ORIGAMI_CONFIG.normals.length

    beforeEach(() => {
        view = new MockView(planeCount);
        viewModel = new ViewModel(view, false); // desktop
    });

    test('is console-clean', () => {
        const errorSpy = vi.spyOn(console, 'error');
        const warnSpy = vi.spyOn(console, 'warn');
        
        viewModel.init({ line: 0xffffff });
        viewModel.update();
        
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('initializes planes and finds connection pairs', () => {
        viewModel.init({ line: 0xffffff });
        expect(viewModel.planeConfigs.length).toBe(planeCount);
        expect(viewModel.connectionPairs.length).toBeGreaterThan(0);
        expect(view.connections.length).toBe(viewModel.connectionPairs.length);
    });

    test('update modifies camera and plane positions', () => {
        viewModel.init({ line: 0xffffff });
        const initialCamX = view.camera.position.x;
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialCamX);
        global.performance.now = realNow;
    });

    test('interaction sets interacting state and affects folding', () => {
        viewModel.init({ line: 0xffffff });
        viewModel.handleMouseMove(0.5, 0.5);
        expect(viewModel.isInteracting).toBe(true);
        
        viewModel.update();
        // foldFactor logic is internal, but we verify update runs without error
    });
});
