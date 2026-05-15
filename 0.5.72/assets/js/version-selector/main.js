import { ViewModel } from './ViewModel.js';

let controller = null;

function initVersionSelector() {
    const root = document.getElementById('md-version-selector');
    if (!root) return;

    if (!controller || controller.root !== root) {
        controller = new ViewModel(root);
    }

    controller.sync();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVersionSelector, { once: true });
} else {
    initVersionSelector();
}

if (typeof document$ !== 'undefined') {
    document$.subscribe(initVersionSelector);
}
