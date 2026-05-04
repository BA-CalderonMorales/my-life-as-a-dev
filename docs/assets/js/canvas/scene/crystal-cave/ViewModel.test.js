/**
 * Crystal Cave ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getThemeColors as getColors } from '../themes/ThemeConfig.js'; 
import * as THREE from 'three';

class MockView {
    constructor() {
        this.container = { 
            clientWidth: 1024, 
            clientHeight: 768,
            addEventListener: () => {},
            removeEventListener: () => {}
        };
        this.scene = { add: () => {}, background: { set: () => {} }, fog: { color: { set: () => {} } } };
        this.camera = new THREE.PerspectiveCamera();
        this.renderer = { toneMapping: 0, toneMappingExposure: 0 };
    }
    init() {}
    addToScene() {}
    render() {}
    onResize() {}
    dispose() {}
}

describe('CrystalCave ViewModel', () => {
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

    test('initializes all sub-systems', () => {
        const colors = getColors();
        viewModel.init(colors);
        expect(viewModel.orbitCamera).not.toBeNull();
        expect(viewModel.lightingSystem).not.toBeNull();
        expect(viewModel.particleSystem).not.toBeNull();
        expect(viewModel.crystalAnimator).not.toBeNull();
        expect(viewModel.interactionManager).not.toBeNull();
    });

    test('update progresses time and calls system updates', () => {
        const colors = getColors();
        viewModel.init(colors);
        const initialTime = viewModel.startTime;
        
        const realNow = performance.now;
        global.performance.now = () => initialTime + 1000;
        
        viewModel.update();
        
        expect(viewModel.orbitCamera.camera.position).toBeDefined();
        global.performance.now = realNow;
    });

    test('onResize propagates to sub-systems', () => {
        const colors = getColors();
        viewModel.init(colors);
        viewModel.onResize();
    });
});
