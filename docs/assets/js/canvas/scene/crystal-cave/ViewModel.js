/**
 * Crystal Cave ViewModel - Animation and Interaction Logic
 */
import { InteractionManager } from '../interaction/InteractionManager.js';
import { getCurrentTheme, themes } from '../themes/ThemeConfig.js';

export class ViewModel {
    constructor(view) {
        this.view = view;
        this.interactionManager = null;
        this.themeObserver = null;
        this.currentTheme = getCurrentTheme();
        this.startTime = performance.now();
    }

    init() {
        this.interactionManager = new InteractionManager(
            this.view.container,
            this.view.orbitCamera.camera,
            this.view.crystals,
            this.view.orbitCamera
        );
        this.interactionManager.attach();

        this._setupThemeObserver();
    }

    update() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        this.view.render(elapsed, this);
    }

    _setupThemeObserver() {
        this.themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-md-color-scheme') {
                    const newTheme = getCurrentTheme();
                    if (newTheme !== this.currentTheme) {
                        const fromColors = themes[this.currentTheme];
                        const toColors = themes[newTheme];
                        this.view.transitionTheme(fromColors, toColors);
                        this.currentTheme = newTheme;
                    }
                }
            });
        });

        this.themeObserver.observe(document.body, { attributes: true });
    }

    dispose() {
        if (this.interactionManager) {
            this.interactionManager.detach();
        }
        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
    }
}
