/**
 * Smoke Mirrors ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = {};
        this.particles = {
            geometry: { attributes: { position: { array: new Float32Array(300), needsUpdate: false } } }
        };
        this.mirrors = Array.from({ length: 3 }, () => ({
            rotation: { x: 0, y: 0 }
        }));
    }
    init() {}
    addParticles(pos) {
        this.particles.geometry.attributes.position.array = pos;
    }
    addMirrors() {}
    render() {}
    onResize() {}
    dispose() {}
}

describe('SmokeMirrors ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes with randomized positions', () => {
        viewModel.init();
        expect(viewModel.positions[0]).not.toBe(0);
        expect(viewModel.count).toBe(2000);
    });

    test('update modifies particle positions and mirror rotations', () => {
        viewModel.init();
        const initialY = view.particles.geometry.attributes.position.array[1];
        const initialMirrorRot = view.mirrors[0].rotation.x;
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.particles.geometry.attributes.position.array[1]).not.toBe(initialY);
        expect(view.mirrors[0].rotation.x).not.toBe(initialMirrorRot);
        global.performance.now = realNow;
    });

    test('particles loop back after reaching bottom', () => {
        viewModel.init();
        // Force a particle to the "top" boundary (in this scene y grows)
        viewModel.view.particles.geometry.attributes.position.array[1] = 11;
        
        viewModel.update();
        
        expect(view.particles.geometry.attributes.position.array[1]).toBeLessThan(0);
    });
});
