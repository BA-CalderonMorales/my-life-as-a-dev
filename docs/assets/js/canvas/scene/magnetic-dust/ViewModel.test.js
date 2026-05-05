import * as THREE from "three";
/**
 * Magnetic Dust ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getColors } from './Model.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
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

    test('is console-clean', () => {
        const errorSpy = vi.spyOn(console, 'error');
        const warnSpy = vi.spyOn(console, 'warn');
        
        viewModel.init();
        viewModel.update();
        
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
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

    test('getColors returns valid theme colors', () => {
        const colors = getColors();
        expect(colors).toBeDefined();
        expect(typeof colors.background).toBe('number');
        expect(typeof colors.dust).toBe('number');
    });

    test('initializes without error in dark mode', () => {
        document.body.setAttribute('data-md-color-scheme', 'slate');
        const errorSpy = vi.spyOn(console, 'error');
        viewModel.init();
        expect(errorSpy).not.toHaveBeenCalled();
    });

    test('initializes without error in light mode', () => {
        document.body.setAttribute('data-md-color-scheme', 'default');
        const errorSpy = vi.spyOn(console, 'error');
        viewModel.init();
        expect(errorSpy).not.toHaveBeenCalled();
    });
});
