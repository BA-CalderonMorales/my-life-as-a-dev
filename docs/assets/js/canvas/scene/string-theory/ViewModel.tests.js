/**
 * String Theory ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor(count) {
        this.strings = Array.from({ length: count }, () => ({
            geometry: { attributes: { position: { array: new Float32Array(6), needsUpdate: false } } }
        }));
        this.camera = { position: { x: 0, y: 0, z: 0 }, lookAt: () => {} };
    }
    render() {}
}

describe('StringTheory ViewModel', () => {
    let view;
    let viewModel;
    const count = 50;
    const length = 20;

    beforeEach(() => {
        view = new MockView(count);
        viewModel = new ViewModel(view, count, length);
    });

    test('initializes with correct string data count', () => {
        viewModel.init();
        expect(viewModel.stringData.length).toBe(count);
    });

    test('string midpoints are within expected range', () => {
        viewModel.init();
        viewModel.stringData.forEach(data => {
            expect(data.midpoint.length()).toBeGreaterThan(length * 0.5);
        });
    });

    test('update modifies string positions and camera', () => {
        viewModel.init();
        const firstPos = view.strings[0].geometry.attributes.position.array;
        const initialX = firstPos[0];
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.strings[0].geometry.attributes.position.array[0]).not.toBe(initialX);
        expect(view.camera.position.x).not.toBe(0);
        global.performance.now = realNow;
    });
});
