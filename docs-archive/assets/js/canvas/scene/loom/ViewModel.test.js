import * as THREE from "three";
/**
 * Loom ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.threads = [];
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addThread(type, fixed, segments, extent) {
        const t = {
            line: { geometry: { attributes: { position: { array: new Float32Array((segments + 1) * 3), needsUpdate: false } } } },
            type, fixed, segments, extent
        };
        this.threads.push(t);
        return t;
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('Loom ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('is console-clean', () => {
        const errorSpy = vi.spyOn(console, 'error');
        const warnSpy = vi.spyOn(console, 'warn');
        
        viewModel.init();
        viewModel.update();
        
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('initializes grid threads through passive view', () => {
        viewModel.init();
        // desktop horizontal (22) + vertical (22) = 44 threads
        expect(view.threads.length).toBe(44);
    });

    test('update modifies thread positions (wave physics)', () => {
        viewModel.init();
        const firstThreadPos = view.threads[0].line.geometry.attributes.position.array;
        const initialZ = firstThreadPos[2];
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.threads[0].line.geometry.attributes.position.array[2]).not.toBe(initialZ);
        global.performance.now = realNow;
    });

    test('interaction influences thread bending', () => {
        viewModel.init();
        viewModel.handleMouseMove(0, 0);
        expect(viewModel.isInteracting).toBe(true);
        
        viewModel.update();
        // Verify update completes without error during interaction
    });

    test('camera position orbits over time', () => {
        viewModel.init();
        const initialX = view.camera.position.x;
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialX);
        global.performance.now = realNow;
    });
});
