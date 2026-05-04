import * as THREE from "three";
/**
 * String Theory ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.strings = [];
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addStrings(count) {
        this.strings = Array.from({ length: count }, () => ({
            geometry: { attributes: { position: { array: new Float32Array(6), needsUpdate: false } } }
        }));
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('StringTheory ViewModel', () => {
    let view;
    let viewModel;

    beforeEach(() => {
        view = new MockView();
        viewModel = new ViewModel(view, false); // desktop
    });

    test('initializes string data configurations through passive view', () => {
        viewModel.init();
        expect(viewModel.stringData.length).toBe(220); // desktop count
        expect(view.strings.length).toBe(220);
    });

    test('update modifies string positions and camera orbit', () => {
        viewModel.init();
        const initialCamX = view.camera.position.x;
        const initialStringX = view.strings[0].geometry.attributes.position.array[0];
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.camera.position.x).not.toBe(initialCamX);
        expect(view.strings[0].geometry.attributes.position.array[0]).not.toBe(initialStringX);
        global.performance.now = realNow;
    });

    test('strings have midpoints within expected length bounds', () => {
        viewModel.init();
        viewModel.stringData.forEach(data => {
            // Half length for desktop is 13
            expect(data.halfLength).toBe(13);
            expect(data.midpoint.length()).toBeGreaterThanOrEqual(13);
        });
    });
});
