/**
 * Version Selector module - Main entry point
 * Provides version selection functionality for documentation
 */

import { Logger } from '../logger.js';

// Create module logger
const logger = new Logger({
  module: 'VersionSelector',
  logLevel: 'info'
});

/**
 * VersionSelector class
 * Handles loading and displaying version information in the site navigation
 */
class VersionSelector {
  constructor(options = {}) {
    // Set default options and merge with provided options
    this.options = {
      selectorClass: '.md-version-dropdown ol',
      ...options
    };
    
    // Get the site URL base path from a meta tag or try to determine it from the current path
    this.siteUrl = document.querySelector('meta[name="site_url"]')?.getAttribute('content') || 
                   window.location.origin + window.location.pathname.split('/').slice(0, 2).join('/');
    
    logger.debug('VersionSelector initialized with site URL: ' + this.siteUrl, 'constructor');
  }

  /**
   * Starts the version selector functionality
   */
  async start() {
    try {
      const versions = await this._fetchVersions();
      if (versions) {
        this._populateVersionDropdown(versions);
        logger.info('Version selector initialized successfully', 'start');
      }
    } catch (error) {
      logger.error(`Failed to initialize version selector: ${error.message}`, 'start');
    }
  }

  /**
   * Fetch available versions from the versions.json file
   * @private
   */
  async _fetchVersions() {
    try {
      // Use the site URL to build the correct path to versions.json
      const versionsUrl = `${this.siteUrl}/versions.json`;
      logger.debug(`Fetching versions from: ${versionsUrl}`, '_fetchVersions');
      
      const response = await fetch(versionsUrl);
      if (!response.ok) {
        logger.warn(`Failed to fetch versions: ${response.status}`, '_fetchVersions');
        return null;
      }
      
      const versions = await response.json();
      logger.debug(`Loaded ${versions.length} versions`, '_fetchVersions');
      return versions;
    } catch (error) {
      logger.error(`Error loading versions: ${error.message}`, '_fetchVersions');
      return null;
    }
  }

  /**
   * Populate the version dropdown with available versions
   * @private
   */
  _populateVersionDropdown(versions) {
    // Find the version dropdown
    const dropdown = document.querySelector(this.options.selectorClass);
    if (!dropdown) {
      logger.warn(`Version dropdown element not found with selector: ${this.options.selectorClass}`, '_populateVersionDropdown');
      return;
    }
    
    // Clear existing versions
    dropdown.innerHTML = '';
    
    // Add each version to the dropdown
    versions.forEach(version => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      // Get the URL for this version
      let versionUrl = `${this.siteUrl}/${version.version}/`;
      if (version.aliases && version.aliases.includes('latest')) {
        versionUrl = `${this.siteUrl}/`;
      }
      
      a.href = versionUrl;
      
      // Set the version display name
      if (version.aliases && version.aliases.length > 0) {
        a.textContent = `${version.title} (${version.aliases.join(', ')})`;
      } else {
        a.textContent = version.title;
      }
      
      li.appendChild(a);
      dropdown.appendChild(li);
    });
    
    logger.debug('Version selector dropdown updated successfully', '_populateVersionDropdown');
  }
}

// Export the VersionSelector class as the default
export default VersionSelector;