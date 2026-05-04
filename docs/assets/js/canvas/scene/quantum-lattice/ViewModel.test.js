import * as THREE from "three";
/**
 * Quantum Lattice ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = { position: { x: 0, y: 0, z: 0 }, lookAt: () => {} };
        this.nodes = { 
            instanceMatrix: { needsUpdate: false }, 
            setMatrixAt: () => {},
            material: { emissiveIntensity: 0 }
        };
        this.lines = {
            geometry: { attributes: { position: { array: new Float32Array(1000), needsUpdate: false } } }
        };
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addInstancedNodes() {}
    addLines() {}
    render() {}
    onResize() {}
    dispose() {}
}

describe('QuantumLattice ViewModel', () => {
    let view;
    let viewModel;
    const colors = { 
        emissiveBase: 0.3,
        lineColor: 0xffffff,
        lineOpacity: 0.5
    };

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false, false); // desktop
    });

    test('initializes with correct node count', () => {
        viewModel.init(colors);
        // gridSize for desktop is 7 -> 7^3 = 343
        expect(viewModel.count).toBe(343);
        expect(viewModel.basePositions.length).toBe(343 * 3);
    });

    test('update modifies node matrices and lines', () => {
        viewModel.init(colors);
        const needsUpdateNodes = view.nodes.instanceMatrix.needsUpdate;
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.nodes.instanceMatrix.needsUpdate).toBe(true);
        expect(view.lines.geometry.attributes.position.needsUpdate).toBe(true);
        global.performance.now = realNow;
    });

    test('calculates correct base positions (centered)', () => {
        viewModel.init(colors);
        // offset = (7-1)*1.48/2 = 4.44
        // Grid should go from -4.44 to 4.44
        expect(viewModel.basePositions[0]).toBeCloseTo(-4.44, 2);
    });
});
