"use strict";
/**
 * SectionScroller.js
 * Adjusts landing page sections to match viewport height
 */
import { defaultLogger } from './logger.js';

const logger = defaultLogger.setModule('sectionScroller');

class SectionScroller {
  constructor() {
    this.sections = [];
    this.resizeHandler = this.applySectionHeights.bind(this);
  }

  init() {
    if (!document.documentElement.classList.contains('landing-page')) {
      logger.info('SectionScroller skipped: not on landing page');
      return;
    }

    this.sections = Array.from(document.querySelectorAll('.scroll-section'));
    if (this.sections.length === 0) {
      logger.warn('No scroll sections found');
      return;
    }

    this.applySectionHeights();
    window.addEventListener('resize', this.resizeHandler);
    logger.info(`SectionScroller initialized with ${this.sections.length} sections`);
  }

  applySectionHeights() {
    const vh = window.innerHeight;
    this.sections.forEach(sec => {
      sec.style.minHeight = `${vh}px`;
    });
    logger.debug(`Applied ${vh}px height to sections`, 'applySectionHeights');
  }
}

export default SectionScroller;

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const scroller = new SectionScroller();
  scroller.init();
});
