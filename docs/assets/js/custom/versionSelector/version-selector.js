// Import the Logger
import { Logger } from '../logger.js';

// Create a module-specific logger
const logger = new Logger({
  module: 'VersionSelector',
  logLevel: 'info'
});

document.addEventListener('DOMContentLoaded', function() {
  // Get the site URL base path from a meta tag or try to determine it from the current path
  const siteUrl = document.querySelector('meta[name="site_url"]')?.getAttribute('content') || 
                 window.location.origin + window.location.pathname.split('/').slice(0, 2).join('/');
  
  // Function to fetch versions and update the dropdown
  async function fetchVersions() {
    try {
      // Use the site URL to build the correct path to versions.json
      const versionsUrl = `${siteUrl}/versions.json`;
      logger.debug(`Fetching versions from: ${versionsUrl}`, 'fetchVersions');
      
      const response = await fetch(versionsUrl);
      if (!response.ok) {
        logger.warn(`Failed to fetch versions: ${response.status}`, 'fetchVersions');
        return; // Silently fail
      }
      
      const versions = await response.json();
      logger.debug(`Loaded ${versions.length} versions`, 'fetchVersions');
      
      // Find the version dropdown
      const dropdown = document.querySelector('.md-version-dropdown ol');
      if (!dropdown) {
        logger.warn('Version dropdown element not found', 'fetchVersions');
        return; // Silently exit if dropdown not found
      }
      
      // Clear existing versions
      dropdown.innerHTML = '';
      
      // Add each version to the dropdown
      versions.forEach(version => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // Get the URL for this version
        let versionUrl = `${siteUrl}/${version.version}/`;
        if (version.aliases && version.aliases.includes('latest')) {
          versionUrl = `${siteUrl}/`;
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
      
      logger.debug('Version selector dropdown updated successfully', 'fetchVersions');
    } catch (error) {
      logger.error(`Error loading versions: ${error.message}`, 'fetchVersions');
    }
  }
  
  // Initialize version selector
  fetchVersions();
});