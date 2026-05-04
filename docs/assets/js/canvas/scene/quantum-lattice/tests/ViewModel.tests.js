/**
 * Quantum Lattice ViewModel Tests
 */
import { ViewModel } from '../ViewModel.js';

// Simple mock for Three.js objects and View
class MockView {
    constructor() {
        this.nodes = {
            instanceMatrix: { array: new Float32Array(1000), needsUpdate: false },
            setMatrixAt: (i, m) => {},
            material: { emissiveIntensity: 0 }
        };
        this.lines = {
            geometry: { attributes: { position: { array: new Float32Array(1000), needsUpdate: false } } }
        };
    }
    render() {}
}

describe('QuantumLattice ViewModel', () => {
    let view;
    let viewModel;
    const colors = { emissiveBase: 0.3 };

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, 3, 1.0, colors);
    });

    test('initializes with correct node count', () => {
        viewModel.init();
        expect(viewModel.count).toBe(27); // 3*3*3
        expect(viewModel.basePositions.length).toBe(27 * 3);
    });

    test('calculates correct base positions (centered)', () => {
        viewModel.init();
        // offset = (3-1)*1/2 = 1.0
        // Grid should go from -1.0 to 1.0
        expect(viewModel.basePositions[0]).toBeCloseTo(-1.0);
        expect(viewModel.basePositions[viewModel.basePositions.length - 1]).toBeCloseTo(1.0);
    });

    test('creates correct number of edges for 3x3x3 grid', () => {
        viewModel.init();
        // For each dimension, 2 internal segments: 2*3*3 = 18
        // Total = 18 * 3 = 54 edges -> 108 indices
        expect(viewModel.edges.length).toBe(108);
    });

    test('update modifies current positions based on elapsed time', () => {
        viewModel.init();
        const initialX = viewModel.currentPositions[0];
        
        // Mock performance.now to simulate time passing
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(viewModel.currentPositions[0]).not.toBe(initialX);
        global.performance.now = realNow;
    });
});
