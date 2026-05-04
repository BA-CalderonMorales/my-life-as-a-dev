import * as THREE from "three";
/**
 * Echo Chains ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.nodes = { instanceMatrix: { needsUpdate: false }, setMatrixAt: () => {} };
        this.connections = [];
        this.rings = [];
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
    const colors = {
        background: 0x000000,
        glowColor: 0xffffff,
        lineColor: 0x888888,
        ambientLight: 0x444444
    };

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('is console-clean', () => {
        const errorSpy = vi.spyOn(console, 'error');
        const warnSpy = vi.spyOn(console, 'warn');
        
        viewModel.init(colors);
        viewModel.update();
        
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('initializes geometry through passive view', () => {
        viewModel.init(colors);
        expect(view.rings.length).toBe(20);
        expect(view.connections.length).toBe(7);
    });

    test('update modifies camera position (orbit)', () => {
        viewModel.init(colors);
        const initialX = view.camera.position.x;
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialX);
        global.performance.now = realNow;
    });

    test('update modifies node matrices', () => {
        viewModel.init(colors);
        const needsUpdate = view.nodes.instanceMatrix.needsUpdate;
        
        viewModel.update();
        
        expect(view.nodes.instanceMatrix.needsUpdate).toBe(true);
    });

    test('echo rings activate periodically', () => {
        viewModel.init(colors);
        
        // Force a ring activation by mocking Math.random
        const realRandom = Math.random;
        Math.random = () => 0.001; // Trigger spawn
        
        viewModel.update();
        
        const activeRings = viewModel.ringStates.filter(s => s.active);
        expect(activeRings.length).toBeGreaterThan(0);
        
        Math.random = realRandom;
    });
});
