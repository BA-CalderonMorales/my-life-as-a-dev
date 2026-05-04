import * as THREE from "three";
/**
 * Magnetic Dust ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = {};
        this.particles = {
            geometry: { attributes: { position: { array: new Float32Array(300), needsUpdate: false } } }
        };
    }
    init() {}
    addParticles(pos) {
        this.particles.geometry.attributes.position.array = pos;
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('MagneticDust ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes with randomized positions within bounds', () => {
        viewModel.init();
        expect(viewModel.positions[0]).not.toBe(0);
        expect(viewModel.count).toBe(10000);
    });

    test('update modifies particle positions (drift and jitter)', () => {
        viewModel.init();
        const initialX = viewModel.positions[0];
        
        viewModel.update();
        
        // Even without interaction, particles drift
        expect(view.particles.geometry.attributes.position.array[0]).not.toBe(initialX);
    });

    test('interaction changes behavior', () => {
        viewModel.init();
        viewModel.handleMouseMove(0, 0);
        expect(viewModel.isInteracting).toBe(true);
        
        viewModel.update();
        expect(viewModel.mouse3D.z).toBe(0); // Plane at z=0
    });

    test('particles wrap around bounds', () => {
        viewModel.init();
        // Force a particle out of bounds
        viewModel.view.particles.geometry.attributes.position.array[0] = 20; // x bound is 15
        
        viewModel.update();
        
        expect(view.particles.geometry.attributes.position.array[0]).toBeLessThan(20);
    });
});
