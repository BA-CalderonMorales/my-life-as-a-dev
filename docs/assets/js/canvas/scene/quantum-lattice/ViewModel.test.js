/**
 * Quantum Lattice ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getColors } from './Model.js';
import * as THREE from 'three';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
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
    updateTheme() {}
}

describe('QuantumLattice ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false, false); // desktop
    });

    test('is console-clean', () => {
        const errorSpy = vi.spyOn(console, 'error');
        const warnSpy = vi.spyOn(console, 'warn');
        
        const colors = getColors();
        viewModel.init(colors);
        viewModel.update();
        
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('initializes with correct node count', () => {
        const colors = getColors();
        viewModel.init(colors);
        // gridSize for desktop is 7 -> 7^3 = 343
        expect(viewModel.count).toBe(343);
        expect(viewModel.basePositions.length).toBe(343 * 3);
    });

    test('update modifies node matrices and lines', () => {
        const colors = getColors();
        viewModel.init(colors);
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.nodes.instanceMatrix.needsUpdate).toBe(true);
        expect(view.lines.geometry.attributes.position.needsUpdate).toBe(true);
        global.performance.now = realNow;
    });
});
