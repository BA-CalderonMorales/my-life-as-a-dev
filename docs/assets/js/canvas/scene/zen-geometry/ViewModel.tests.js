/**
 * Zen Geometry ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = { position: { x: 0, y: 0, z: 0 }, lookAt: () => {} };
        this.nodes = { 
            instanceMatrix: { needsUpdate: false }, 
            setMatrixAt: () => {} 
        };
        this.connections = [];
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addCentralForm() {}
    addInstancedNodes() {}
    addConnections(count) {
        this.connections = Array.from({ length: count }, () => ({
            geometry: { attributes: { position: { array: new Float32Array(6), needsUpdate: false } } }
        }));
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('ZenGeometry ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes with correct node definitions', () => {
        viewModel.init();
        expect(viewModel.nodeStates.length).toBe(5); // ZEN_NODE_DEFINITIONS
        expect(view.connections.length).toBe(7); // ZEN_CONNECTIONS
    });

    test('update modifies camera position and node matrices', () => {
        viewModel.init();
        const initialCamX = view.camera.position.x;
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialCamX);
        expect(view.nodes.instanceMatrix.needsUpdate).toBe(true);
        global.performance.now = realNow;
    });

    test('update synchronizes connection line endpoints', () => {
        viewModel.init();
        const line = view.connections[0];
        const initialPos = line.geometry.attributes.position.array[0];
        
        viewModel.update();
        
        expect(line.geometry.attributes.position.needsUpdate).toBe(true);
    });
});
