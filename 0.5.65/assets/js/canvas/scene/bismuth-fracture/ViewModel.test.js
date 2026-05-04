import * as THREE from "three";
/**
 * Bismuth Fracture ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';

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
});
