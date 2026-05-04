/**
 * Synaptic Flash ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import * as THREE from 'three';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.nodes = [];
        this.connections = [];
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addNodes(count) {
        this.nodes = Array.from({ length: count }, () => ({
            material: { emissiveIntensity: 0 },
            position: new THREE.Vector3()
        }));
    }
    addConnections(count) {
        this.connections = Array.from({ length: count }, () => ({
            material: { opacity: 0 },
            geometry: { attributes: { position: { array: new Float32Array(6), needsUpdate: false } } }
        }));
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('SynapticFlash ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        vi.useFakeTimers();
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('initializes neural network tree configurations through passive view', () => {
        viewModel.init();
        expect(viewModel.nodes.length).toBe(35); // desktop count
        expect(viewModel.edges.length).toBeGreaterThanOrEqual(34);
        expect(view.nodes.length).toBe(35);
    });

    test('emits pulse from root periodically', () => {
        viewModel.init();
        expect(viewModel.pulses.length).toBe(0);

        vi.advanceTimersByTime(2000);
        viewModel.update();

        expect(viewModel.pulses.length).toBe(1);
        expect(viewModel.pulses[0].nodeIdx).toBe(0);
    });

    test('update modifies camera position and node emissive intensities', () => {
        viewModel.init();
        const initialCamX = view.camera.position.x;

        // Inject a pulse
        viewModel.pulses.push({ nodeIdx: 0, age: 0.1, propagated: false });

        vi.advanceTimersByTime(1000);
        viewModel.update();

        expect(view.camera.position.x).not.toBe(initialCamX);
        expect(viewModel.nodes[0].targetEmissive).toBeGreaterThan(0.1);
    });
});
