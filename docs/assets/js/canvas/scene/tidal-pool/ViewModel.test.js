/**
 * Tidal Pool ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = { position: { x: 0, y: 0, z: 0 }, lookAt: () => {} };
        this.particles = {
            geometry: { attributes: { position: { array: new Float32Array(300), needsUpdate: false } } }
        };
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addParticles(pos, col) {
        this.particles.geometry.attributes.position.array = pos;
        this.particles.geometry.attributes.color = { array: col };
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('TidalPool ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes with circular particle distribution', () => {
        viewModel.init();
        expect(viewModel.positions[0]).not.toBe(0);
        expect(viewModel.count).toBe(6000); // desktop
    });

    test('update modifies particle Z-axis based on wave physics', () => {
        viewModel.init();
        const initialZ = view.particles.geometry.attributes.position.array[2];
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.particles.geometry.attributes.position.array[2]).not.toBe(initialZ);
        global.performance.now = realNow;
    });

    test('camera position tilts slightly over time', () => {
        viewModel.init();
        const initialCamX = view.camera.position.x;
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialCamX);
        global.performance.now = realNow;
    });
});
