/**
 * Digital Rain ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

// Simple mock for the passive View
class MockView {
    constructor() {
        this.particles = {
            geometry: { 
                attributes: { 
                    position: { array: new Float32Array(0), needsUpdate: false },
                    color: { array: new Float32Array(0), needsUpdate: false }
                } 
            }
        };
    }
    addParticles(p, c) { 
        this.particles.geometry.attributes.position.array = p;
        this.particles.geometry.attributes.color.array = c;
    }
    addFloor() {}
    render() {}
}

describe('DigitalRain ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes with correct particle count', () => {
        viewModel.init();
        expect(viewModel.count).toBe(1500); // 50 cols * 30 particles
        expect(viewModel.positions.length).toBe(4500);
    });

    test('update modifies particle positions (falling)', () => {
        viewModel.init();
        const initialY = viewModel.positions[1];
        
        viewModel.update();
        
        expect(viewModel.positions[1]).toBeLessThan(initialY);
    });

    test('particles reset to top after reaching bottom', () => {
        viewModel.init();
        // Force a particle to the bottom
        viewModel.positions[1] = -13; 
        
        viewModel.update();
        
        expect(viewModel.positions[1]).toBe(12); // config.physics.resetY
        expect(viewModel.flashes[0]).toBe(1.0);
    });

    test('flashes decay over time', () => {
        viewModel.init();
        viewModel.flashes[0] = 1.0;
        
        viewModel.update();
        
        expect(viewModel.flashes[0]).toBeLessThan(1.0);
    });
});
