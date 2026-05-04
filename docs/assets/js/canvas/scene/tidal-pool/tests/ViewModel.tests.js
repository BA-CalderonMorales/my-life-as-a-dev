/**
 * Tidal Pool ViewModel Tests
 */
import { ViewModel } from '../ViewModel.js';

class MockView {
    constructor(count) {
        this.particles = {
            geometry: { attributes: { position: { array: new Float32Array(count * 3), needsUpdate: false } } }
        };
        this.camera = { position: { x: 0, y: 0, z: 0 }, lookAt: () => {} };
    }
    render() {}
}

describe('TidalPool ViewModel', () => {
    let view;
    let viewModel;
    const count = 100;

    beforeEach(() => {
        view = new MockView(count);
        viewModel = new ViewModel(view, count);
    });

    test('update modifies particle Z-axis (wave physics)', () => {
        const positions = view.particles.geometry.attributes.position.array;
        const initialZ = positions[2];
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(positions[2]).not.toBe(initialZ);
        global.performance.now = realNow;
    });

    test('interaction influences particle positions (ripple physics)', () => {
        viewModel.handleMouseMove(0, 0);
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        const positions = view.particles.geometry.attributes.position.array;
        // Ripple force should have added to the base wave
        expect(positions[2]).not.toBe(0);
        global.performance.now = realNow;
    });

    test('camera position orbits slightly', () => {
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(0);
        global.performance.now = realNow;
    });
});
