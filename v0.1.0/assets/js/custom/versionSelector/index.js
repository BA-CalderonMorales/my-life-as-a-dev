/**
 * Version Selector Module
 * 
 * Entry point for the version selector functionality
 */
import { VersionManager } from './VersionManager.js';
import { VersionSelectorUI } from './VersionSelectorUI.js';

class VersionSelector {
  constructor() {
    this.versionManager = new VersionManager();
    this.ui = new VersionSelectorUI();
  }

  /**
   * Initialize the version selector
   */
  async init() {
    try {
      console.log('Initializing version selector...');
      
      // Get all versions from the repository
      const versions = await this.versionManager.fetchVersions();
      
      // Create and render the UI
      if (versions && versions.length > 0) {
        this.ui.render(versions, this.versionManager.getCurrentVersion(versions), this.versionManager.getBaseUrl());
      }
      
      console.log('Version selector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize version selector:', error);
    }
  }
}

// Initialize on document ready
document.addEventListener('DOMContentLoaded', () => {
  const versionSelector = new VersionSelector();
  versionSelector.init();
});

export default VersionSelector;