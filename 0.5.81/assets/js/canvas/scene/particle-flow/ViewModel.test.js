import * as THREE from "three";
/**
 * Particle Flow ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.particles = {
            geometry: { attributes: { position: { array: new Float32Array(300), needsUpdate: false } } }
        };
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addParticles(pos) {
        this.particles.geometry.attributes.position.array = pos;
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('ParticleFlow ViewModel', () => {
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

    test('initializes with randomized positions', () => {
        viewModel.init();
        expect(viewModel.positions[0]).not.toBe(0);
        expect(viewModel.count).toBe(8000);
    });

    test('update modifies particle positions (field drift)', () => {
        viewModel.init();
        const initialX = view.particles.geometry.attributes.position.array[0];
        
        viewModel.update();
        
        expect(view.particles.geometry.attributes.position.array[0]).not.toBe(initialX);
    });

    test('particles wrap around boundaries during update', () => {
        viewModel.init();
        // Force a particle out of bounds (x > 20)
        viewModel.view.particles.geometry.attributes.position.array[0] = 25;
        
        viewModel.update();
        
        expect(viewModel.view.particles.geometry.attributes.position.array[0]).toBeLessThan(0);
    });

    test('interaction sets interacting state', () => {
        viewModel.init();
        viewModel.handleMouseMove(0.5, 0.5);
        expect(viewModel.isInteracting).toBe(true);
        
        viewModel.handleInteractionEnd();
        expect(viewModel.isInteracting).toBe(false);
    });
});
