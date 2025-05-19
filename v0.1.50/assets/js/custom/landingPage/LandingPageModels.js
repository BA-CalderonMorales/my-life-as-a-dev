/**
 * LandingPage Models
 * 
 * This file contains the model classes for the landing page MVVM implementation.
 * Models represent the data structures and state for the landing page components.
 */

/**
 * ScrollModel - Manages scroll-related data
 */
export class ScrollModel {
  constructor() {
    this.scrollIndicators = [];
    this.scrollProgress = null;
  }

  initialize() {
    this.scrollIndicators = Array.from(document.querySelectorAll('.scroll-indicator'));
    this.scrollProgress = document.querySelector('.scroll-progress');
    return {
      scrollIndicators: this.scrollIndicators,
      scrollProgress: this.scrollProgress
    };
  }
}

/**
 * AnimationModel - Manages animation-related data
 */
export class AnimationModel {
  constructor() {
    this.sections = [];
    this.labels = [];
  }

  initialize() {
    this.sections = Array.from(document.querySelectorAll('.tabbed-set .tabbed-content section'));
    this.labels = Array.from(document.querySelectorAll('.tabbed-labels > label'));
    return {
      sections: this.sections,
      labels: this.labels
    };
  }
}

/**
 * ContentModel - Manages miscellaneous content elements
 */
export class ContentModel {
  constructor() {
    this.copyrightElement = null;
    this.currentYear = new Date().getFullYear();
  }

  initialize() {
    this.copyrightElement = document.querySelector('.copyright-year');
    return {
      copyrightElement: this.copyrightElement,
      currentYear: this.currentYear
    };
  }
}
