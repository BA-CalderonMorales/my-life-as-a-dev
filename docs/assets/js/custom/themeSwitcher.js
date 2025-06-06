"use strict";
/**
 * ThemeSwitcher.js
 * Encapsulates light/dark theme toggling for the site.
 */

import { defaultLogger } from './logger.js';

const logger = defaultLogger.setModule('themeSwitcher');

let toggleButton = null;

/**
 * Toggle between light and dark themes.
 */
export function switchTheme() {
  const current = document.documentElement.getAttribute('data-md-color-scheme') || 'default';
  const next = current === 'slate' ? 'default' : 'slate';
  document.documentElement.setAttribute('data-md-color-scheme', next);
  document.body.setAttribute('data-md-color-scheme', next);
  logger.debug(`Switched theme to ${next}`);
}

/**
 * Initialize the theme toggle button listener.
 */
export function initThemeToggle() {
  toggleButton = document.querySelector('.md-header__button[data-md-component="palette"]');
  if (!toggleButton) {
    logger.warn('Theme toggle button not found');
    return;
  }
  toggleButton.addEventListener('click', () => {
    setTimeout(switchTheme, 50); // allow Material to update first
  });
  logger.debug('Theme toggle initialized');
}

// Auto-init when module is loaded
initThemeToggle();
