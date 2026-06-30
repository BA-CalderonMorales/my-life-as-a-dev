import * as THREE from "three";
/**
 * Bismuth Fracture ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getColors } from './Model.js';

class MockView {
    constructor() {
        this.instancedMesh = {
            instanceMatrix: { needsUpdate: false },
            instanceColor: { needsUpdate: false },
            setMatrixAt: (i, m) => {},
            setColorAt: (i, c) => {}
        };
    }
    addInstancedMesh(count) {}
    render() {}
}

describe('BismuthFracture ViewModel', () => {
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

    test('initializes with correct number of stacks', () => {
        viewModel.init();
        expect(viewModel.stackConfigs.length).toBe(12); // BISMUTH_CONFIG.desktop.stackCount
    });

    test('calculates total instances correctly', () => {
        viewModel.init();
        const sum = viewModel.stackConfigs.reduce((acc, s) => acc + s.steps, 0);
        expect(viewModel.totalInstances).toBe(sum);
    });

    test('update modifies stack rotations', () => {
        viewModel.init();
        const initialRot = viewModel.stackConfigs[0].currentRot;
        
        viewModel.update();
        
        expect(viewModel.stackConfigs[0].currentRot).not.toBe(initialRot);
    });

    test('getColors returns valid theme colors', () => {
        const colors = getColors();
        expect(colors).toBeDefined();
        expect(typeof colors.background).toBe('number');
        expect(typeof colors.ambient).toBe('number');
        expect(typeof colors.directional).toBe('number');
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
