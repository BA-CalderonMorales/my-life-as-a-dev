import * as THREE from "three";
/**
 * Solar Flare ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.particles = {
            geometry: { 
                attributes: { 
                    position: { array: new Float32Array(300), needsUpdate: false },
                    color: { array: new Float32Array(300), needsUpdate: false }
                } 
            }
        };
        this.sun = { rotation: { y: 0 } };
        this.sunGlow = { scale: { setScalar: (s) => {} } };
    }
    init() {}
    addSun() {}
    addParticles(pos, col) {
        this.particles.geometry.attributes.position.array = pos;
        this.particles.geometry.attributes.color.array = col;
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('SolarFlare ViewModel', () => {
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

    test('initializes with particles at origin', () => {
        viewModel.init();
        expect(viewModel.positions[0]).toBe(0);
        expect(viewModel.count).toBe(8000);
    });

    test('update modifies particle ages and positions', () => {
        viewModel.init();
        const initialAge = viewModel.ages[0];
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(viewModel.ages[0]).toBeGreaterThan(initialAge);
        expect(viewModel.positions[0]).not.toBe(0);
        global.performance.now = realNow;
    });

    test('particles reset after lifetime', () => {
        viewModel.init();
        viewModel.lifetimes[0] = 0.01;
        viewModel.ages[0] = 0.02; // Already expired
        
        viewModel.update();
        
        expect(viewModel.ages[0]).toBeCloseTo(0, 1);
        expect(viewModel.positions[0]).toBe(0); // Should reset to origin
    });
});
