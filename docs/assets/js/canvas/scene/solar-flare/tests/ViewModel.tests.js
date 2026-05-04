/**
 * Solar Flare ViewModel Tests
 */
import { ViewModel } from '../ViewModel.js';

class MockView {
    constructor() {
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
    render() {}
}

describe('SolarFlare ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, 100);
    });

    test('initializes with particles at origin', () => {
        viewModel.init();
        const pos = view.particles.geometry.attributes.position.array;
        expect(pos[0]).toBe(0);
        expect(pos[1]).toBe(0);
        expect(pos[2]).toBe(0);
    });

    test('resetParticle sets randomized velocities', () => {
        const pos = view.particles.geometry.attributes.position.array;
        const col = view.particles.geometry.attributes.color.array;
        viewModel._resetParticle(pos, col, 0, false);
        
        expect(viewModel.velocities[0]).not.toBe(0);
        expect(viewModel.lifetimes[0]).toBeGreaterThan(0);
    });

    test('update progresses ages and positions', () => {
        viewModel.init();
        const initialAge = viewModel.ages[0];
        
        // Simulate time passage
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(viewModel.ages[0]).toBeGreaterThan(initialAge);
        global.performance.now = realNow;
    });

    test('particle resets after lifetime expires', () => {
        viewModel.init();
        viewModel.lifetimes[0] = 0.01; // Short lifetime
        viewModel.ages[0] = 0.02; // Already expired
        
        const pos = view.particles.geometry.attributes.position.array;
        pos[0] = 100; // Move far away
        
        viewModel.update();
        
        expect(pos[0]).toBe(0); // Should be reset to origin
        expect(viewModel.ages[0]).toBeCloseTo(0, 1);
    });
});
