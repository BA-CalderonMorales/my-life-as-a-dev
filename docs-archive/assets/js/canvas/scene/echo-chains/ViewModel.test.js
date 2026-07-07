/**
 * Echo Chains ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getColors } from './Model.js';
import * as THREE from 'three';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.nodes = { instanceMatrix: { needsUpdate: false }, setMatrixAt: () => {} };
        this.connections = [];
        this.rings = [];
        this.container = { clientWidth: 1024, clientHeight: 768 };
        this.centralForm = { material: { color: { setHex: () => {} }, emissive: { setHex: () => {} } }, userData: { wireframe: { material: { color: { setHex: () => {} } } } } };
    }
    init() {}
    addCentralForm() {}
    addInstancedNodes() {}
    addConnections(conns) {
        this.connections = conns.map(() => ({
            geometry: { attributes: { position: { array: new Float32Array(6), needsUpdate: false } } }
        }));
    }
    addRingPool(size) {
        this.rings = Array.from({ length: size }, () => ({
            visible: false,
            position: { copy: () => {} },
            scale: { setScalar: () => {} },
            material: { opacity: 0 }
        }));
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('EchoChains ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
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

    test('initializes geometry through passive view', () => {
        const colors = getColors();
        viewModel.init(colors);
        expect(view.rings.length).toBe(20);
        expect(view.connections.length).toBe(7);
    });

    test('update modifies camera position (orbit)', () => {
        const colors = getColors();
        viewModel.init(colors);
        const initialX = view.camera.position.x;
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialX);
        global.performance.now = realNow;
    });
});
