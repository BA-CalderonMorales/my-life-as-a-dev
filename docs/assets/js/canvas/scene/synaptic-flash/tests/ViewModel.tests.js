/**
 * Synaptic Flash ViewModel Tests
 */
import { ViewModel } from '../ViewModel.js';

class MockView {
    constructor(count, edges) {
        this.nodes = Array.from({ length: count }, () => ({
            material: { emissiveIntensity: 0 },
            position: { x: 0, y: 0, z: 0 }
        }));
        this.connections = Array.from({ length: edges }, () => ({
            material: { opacity: 0 },
            geometry: { attributes: { position: { array: new Float32Array(6), needsUpdate: false } } }
        }));
        this.camera = { position: { x: 0, y: 0, z: 0 }, lookAt: () => {} };
    }
    render() {}
}

describe('SynapticFlash ViewModel', () => {
    let view;
    let viewModel;
    const count = 10;

    beforeEach(() => {
        // ViewModel init generates random edges, so we create a mock after init
        const tempVM = new ViewModel({}, count);
        const { edges } = tempVM.init();
        view = new MockView(count, edges.length);
        viewModel = new ViewModel(view, count);
        viewModel.init();
    });

    test('initializes with correct node and edge count', () => {
        expect(viewModel.nodes.length).toBe(count);
        expect(viewModel.edges.length).toBeGreaterThanOrEqual(count - 1); // Tree + potential extra
    });

    test('emits pulse from root periodically', () => {
        expect(viewModel.pulses.length).toBe(0);
        
        // Mock time to trigger pulse
        const realNow = performance.now;
        global.performance.now = () => 2000;
        
        viewModel.update();
        
        expect(viewModel.pulses.length).toBe(1);
        expect(viewModel.pulses[0].nodeIdx).toBe(0);
        global.performance.now = realNow;
    });

    test('pulses propagate and decay', () => {
        viewModel.pulses.push({ nodeIdx: 0, age: 0.2, propagated: false });
        
        // Update to trigger decay and potential propagation
        viewModel.update();
        
        expect(viewModel.nodes[0].targetEmissive).toBeGreaterThan(0.1);
        // Propagation is random, but let's check that age increases
        expect(viewModel.pulses[0].age).toBeGreaterThan(0.2);
    });
});
