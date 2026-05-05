import * as THREE from "three";
/**
 * Holographic Sand ViewModel Tests
 */
import { ViewModel } from './ViewModel.js';
import { getColors } from './Model.js';

class MockView {
    constructor() {
        this.particles = { geometry: { attributes: { position: { needsUpdate: false } } } };
    }
    init() {}
    addParticles(pos) {
        this.particles.geometry.attributes.position.array = pos;
    }
    addGrid() {}
    render() {}
    onResize() {}
    dispose() {}
}

describe('HolographicSand ViewModel', () => {
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

    test('initializes with randomized positions', () => {
        viewModel.init();
        expect(viewModel.positions[0]).not.toBe(0);
        expect(viewModel.count).toBe(8000);
    });

    test('update modifies particle positions (drift)', () => {
        viewModel.init();
        const initialX = viewModel.positions[0];
        
        viewModel.update();
        
        expect(viewModel.positions[0]).not.toBe(initialX);
    });

    test('triggerFormation changes state to forming', () => {
        viewModel.init();
        viewModel.triggerFormation();
        
        expect(viewModel.state).toBe('forming');
        expect(viewModel.progress).toBe(0);
    });

    test('formation progresses over time', () => {
        viewModel.init();
        viewModel.triggerFormation();
        
        viewModel.update();
        
        expect(viewModel.progress).toBeGreaterThan(0);
    });

    test('getColors returns valid theme colors', () => {
        const colors = getColors();
        expect(colors).toBeDefined();
        expect(typeof colors.background).toBe('number');
        expect(typeof colors.sand).toBe('number');
        expect(typeof colors.grid).toBe('number');
        expect(typeof colors.gridSub).toBe('number');
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
