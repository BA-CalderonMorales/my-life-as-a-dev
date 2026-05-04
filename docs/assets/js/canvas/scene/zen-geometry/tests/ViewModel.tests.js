/**
 * Zen Geometry ViewModel Tests
 */
import { ViewModel } from '../ViewModel.js';

class MockView {
    constructor(nodeCount, connCount) {
        this.nodes = Array.from({ length: nodeCount }, () => ({
            position: { x: 0, y: 0, z: 0 },
            rotation: { set: () => {} },
            scale: { setScalar: () => {} }
        }));
        this.lines = Array.from({ length: connCount }, () => ({
            geometry: { attributes: { position: { array: new Float32Array(6), needsUpdate: false } } }
        }));
        this.camera = { position: { x: 0, y: 0, z: 0 }, lookAt: () => {} };
        this.ambientLight = { color: { setHex: () => {} } };
    }
    render() {}
}

describe('ZenGeometry ViewModel', () => {
    let view;
    let viewModel;
    const nodes = [
        { position: [0,0,0], size: 1 },
        { position: [2,2,2], size: 1 }
    ];
    const connections = [[0, 1]];

    beforeEach(() => {
        view = new MockView(nodes.length, connections.length);
        viewModel = new ViewModel(view, nodes, connections);
    });

    test('update modifies node and camera positions', () => {
        const initialX = view.nodes[0].position.x;
        
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.nodes[0].position.x).not.toBe(initialX);
        expect(view.camera.position.x).not.toBe(0);
        global.performance.now = realNow;
    });

    test('interaction sets interacting state', () => {
        viewModel.handleMouseMove(0.5, 0.5);
        expect(viewModel.isInteracting).toBe(true);
        
        viewModel.handleInteractionEnd();
        expect(viewModel.isInteracting).toBe(false);
    });
});
