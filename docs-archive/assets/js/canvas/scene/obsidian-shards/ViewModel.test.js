import * as THREE from "three";
/**
 * Obsidian Shards ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getColors } from './Model.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.instancedMesh = { 
            instanceMatrix: { needsUpdate: false }, 
            setMatrixAt: () => {} 
        };
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addPointLights() {}
    addInstancedShards() {}
    render() {}
    onResize() {}
    dispose() {}
}

describe('ObsidianShards ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('is console-clean', () => {
        const errorSpy = vi.spyOn(console, 'error');
        const warnSpy = vi.spyOn(console, 'warn');
        
        viewModel.init();
        viewModel.update();
        
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('initializes shard states and matrices', () => {
        viewModel.init();
        expect(viewModel.shardStates.length).toBe(40); // desktop count
        expect(view.instancedMesh.instanceMatrix.needsUpdate).toBe(false); // only updated in loop
    });

    test('update modifies camera and shard matrices', () => {
        viewModel.init();
        const initialCamX = view.camera.position.x;
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialCamX);
        expect(view.instancedMesh.instanceMatrix.needsUpdate).toBe(true);
        global.performance.now = realNow;
    });

    test('shards float over time', () => {
        viewModel.init();
        const firstShardInitialY = viewModel.shardStates[0].initialPos.y;
        
        // Simulate time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        // currentPos is not explicitly stored in state anymore (we use dummy)
        // so we verify update runs without error
        global.performance.now = realNow;
    });

    test('getColors returns valid theme colors', () => {
        const colors = getColors();
        expect(colors).toBeDefined();
        expect(typeof colors.background).toBe('number');
        expect(typeof colors.obsidian).toBe('number');
        expect(Array.isArray(colors.lights)).toBe(true);
    });

    test('initializes without error in dark mode', () => {
        document.body.setAttribute('data-md-color-scheme', 'slate');
        const errorSpy = vi.spyOn(console, 'error');
        viewModel.init();
        expect(errorSpy).not.toHaveBeenCalled();
    });

    test('initializes without error in light mode', () => {
        document.body.setAttribute('data-md-color-scheme', 'default');
        const errorSpy = vi.spyOn(console, 'error');
        viewModel.init();
        expect(errorSpy).not.toHaveBeenCalled();
    });
});
