/**
 * Smoke Mirrors ViewModel Tests
 */
import { ViewModel } from '../ViewModel.js';

class MockView {
    constructor() {
        this.particles = {
            geometry: { attributes: { position: { array: new Float32Array(300), needsUpdate: false } } }
        };
        this.mirrors = [];
        this.camera = {};
    }
    render() {}
}

describe('SmokeMirrors ViewModel', () => {
    let view;
    let viewModel;
    const initialPositions = new Float32Array(300).fill(0);

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, 100);
        viewModel.init(initialPositions);
    });

    test('initializes with correct particle count', () => {
        expect(viewModel.count).toBe(100);
        expect(viewModel.originalPositions.length).toBe(300);
    });

    test('update modifies particle positions (drift)', () => {
        const positions = view.particles.geometry.attributes.position.array;
        const initialY = positions[1];
        
        // Simulate time passage
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(positions[1]).not.toBe(initialY);
        global.performance.now = realNow;
    });

    test('interaction sets interacting state', () => {
        viewModel.handleMouseMove(0.5, 0.5);
        expect(viewModel.isInteracting).toBe(true);
        
        viewModel.handleInteractionEnd();
        expect(viewModel.isInteracting).toBe(false);
    });
});
