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
  
  // Determine if we're in a development environment
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('.app.github.dev');
  
  logger.debug(`Environment: ${isDev ? 'Development' : 'Production'}`, 'init');
  
  // Function to try fetching from multiple URLs until one works
  async function tryFetchMultipleLocations(urls) {
    for (const url of urls) {
      try {
        logger.debug(`Attempting to fetch from: ${url}`, 'tryFetchMultipleLocations');
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        logger.debug(`Failed to fetch from ${url}: ${error.message}`, 'tryFetchMultipleLocations');
        // Continue to the next URL
      }
    }
    
    // If all fetches failed, throw an error
    throw new Error('Failed to fetch versions from any location');
  }
  
  // Function to create a fallback version object for development
  function createDevFallbackVersion() {
    const currentPath = window.location.pathname;
    // Extract version from URL if it exists
    const pathParts = currentPath.split('/').filter(Boolean);
    const possibleVersion = pathParts[1]; // Assuming URL format: /site/version/page.html
    
    const version = possibleVersion && possibleVersion.startsWith('v') ? possibleVersion : 'dev';
    
    return [
      {
        version: version,
        title: 'Development',
        aliases: ['latest', 'dev']
      }
    ];
  }
  
  // Function to fetch versions and update the dropdown
  async function fetchVersions() {
    try {
      // Build a list of URLs to try, in order of preference
      const possibleUrls = [
        `${siteUrl}/versions.json`,                // Standard location
        `${window.location.origin}/versions.json`, // Root of the site
        `/versions.json`,                          // Server root
        `./versions.json`,                         // Current directory
        `../versions.json`,                        // Parent directory
      ];
      
      if (isDev) {
        // Add development-specific locations
        possibleUrls.push(`${window.location.origin}/docs/versions.json`);
      }
      
      logger.debug(`Will try these URLs: ${possibleUrls.join(', ')}`, 'fetchVersions');
      
      // Try to fetch versions from multiple locations
      const versions = await tryFetchMultipleLocations(possibleUrls)
        .catch(error => {
          // If in development environment and all fetches fail, create a fallback
          if (isDev) {
            logger.warn('Using fallback version data for development', 'fetchVersions');
            return createDevFallbackVersion();
          }
          throw error; // Re-throw if not in development
        });
      
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
        
        // In development, make relative links work better
        if (isDev) {
          versionUrl = version.version === 'dev' ? '/' : `/${version.version}/`;
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
      
      // If in development, provide visible indication of the issue
      if (isDev) {
        const dropdown = document.querySelector('.md-version');
        if (dropdown) {
          const devIndicator = document.createElement('span');
          devIndicator.textContent = '(Dev Mode)';
          devIndicator.style.fontSize = '0.7rem';
          devIndicator.style.marginLeft = '5px';
          devIndicator.style.color = '#ff5252';
          dropdown.appendChild(devIndicator);
        }
      }
    }
  }
  
  // Initialize version selector
  fetchVersions();
});