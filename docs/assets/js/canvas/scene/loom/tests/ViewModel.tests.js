/**
 * Loom ViewModel Tests
 */
import { ViewModel } from '../ViewModel.js';

class MockView {
    constructor(threadCount, segments) {
        this.threads = Array.from({ length: threadCount }, () => ({
            line: { geometry: { attributes: { position: { array: new Float32Array((segments + 1) * 3), needsUpdate: false } } } },
            type: 'horizontal',
            fixed: 0,
            segments: segments,
            extent: 10
        }));
        this.camera = { position: { x: 0, y: 0, z: 0 }, lookAt: () => {} };
    }
    render() {}
}

describe('Loom ViewModel', () => {
    let view;
    let viewModel;
    const threadCount = 10;
    const segments = 20;

    beforeEach(() => {
        view = new MockView(threadCount, segments);
        viewModel = new ViewModel(view);
    });

    test('update modifies thread positions (wave physics)', () => {
        const firstPos = view.threads[0].line.geometry.attributes.position.array;
        const initialZ = firstPos[2];
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.threads[0].line.geometry.attributes.position.array[2]).not.toBe(initialZ);
        global.performance.now = realNow;
    });

    test('interaction influences thread positions (bend physics)', () => {
        viewModel.handleMouseMove(0, 0);
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        // At (0,0), the bendZ should be significant
        expect(view.threads[0].line.geometry.attributes.position.array[2]).not.toBe(0);
        global.performance.now = realNow;
    });

    test('camera position orbits over time', () => {
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(0);
        expect(view.camera.position.z).not.toBe(0);
        global.performance.now = realNow;
    });
});
