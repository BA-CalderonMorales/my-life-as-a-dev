import * as THREE from "three";
/**
 * Neon Geode ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getColors } from './Model.js';

class MockView {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
        this.crystals = [];
        this.core = { scale: { setScalar: () => {} }, rotation: { y: 0 } };
        this.sparkles = { geometry: { attributes: { position: { array: new Float32Array(300), needsUpdate: false } } } };
        this.container = { clientWidth: 1024, clientHeight: 768 };
    }
    init() {}
    addPointLights() {}
    addGeode() {}
    addCrystal() {
        const c = { 
            scale: { set: () => {} }, 
            position: { set: () => {} }, 
            rotation: { set: () => {}, y: 0 },
            userData: {},
            material: { emissiveIntensity: 0 }
        };
        this.crystals.push(c);
        return c;
    }
    addSparkles(pos) {
        this.sparkles.geometry.attributes.position.array = pos;
    }
    render() {}
    onResize() {}
    dispose() {}
}

describe('NeonGeode ViewModel', () => {
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

    test('initializes crystal and sparkle states', () => {
        viewModel.init();
        expect(view.crystals.length).toBe(38); // desktop count
        expect(viewModel.sparklePositions.length).toBe(1200 * 3);
    });

    test('update modifies core scale and sparkle positions', () => {
        viewModel.init();
        const initialSparkleY = view.sparkles.geometry.attributes.position.array[1];
        
        // Mock time
        const realNow = performance.now;
        global.performance.now = () => 1000;
        
        viewModel.update();
        
        expect(view.sparkles.geometry.attributes.position.array[1]).not.toBe(initialSparkleY);
        global.performance.now = realNow;
    });

    test('sparkles loop back during update', () => {
        viewModel.init();
        // Force a sparkle to the top
        viewModel.view.sparkles.geometry.attributes.position.array[1] = 5.0;
        
        viewModel.update();
        
        expect(viewModel.view.sparkles.geometry.attributes.position.array[1]).toBeLessThan(0);
    });

    test('getColors returns valid theme colors', () => {
        const colors = getColors();
        expect(colors).toBeDefined();
        expect(typeof colors.background).toBe('number');
        expect(typeof colors.floor).toBe('number');
        expect(typeof colors.core).toBe('number');
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
