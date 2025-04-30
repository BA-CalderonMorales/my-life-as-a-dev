/**
 * VersionManager
 * 
 * Handles fetching, sorting and comparing versions from the repository
 */
export class VersionManager {
  constructor() {
    this.repoUrl = this._getRepositoryUrl();
  }

  /**
   * Get the repository URL from meta tags or fallback to default
   * @returns {string} The repository URL
   */
  _getRepositoryUrl() {
    return document.querySelector('meta[name="repo-url"]')?.content 
      || document.querySelector('link[rel="repository"]')?.href
      || 'https://github.com/BA-CalderonMorales/my-life-as-a-dev';
  }

  /**
   * Get the base URL for navigation between versions
   * @returns {string} The base URL
   */
  getBaseUrl() {
    const siteUrl = document.querySelector('meta[name="site_url"]')?.content || '';
    return siteUrl.replace(/\/[^/]*\/?$/, '/');
  }

  /**
   * Compare two version strings for sorting
   * @param {string} a First version string
   * @param {string} b Second version string
   * @returns {number} Comparison result (-1, 0, or 1)
   */
  _compareVersions(a, b) {
    // Remove leading 'v' or '=' if present
    const verA = a.replace(/^[v=]/, '');
    const verB = b.replace(/^[v=]/, '');
    
    // Split into components
    const partsA = verA.split('.');
    const partsB = verB.split('.');
    
    // Compare each component
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = parseInt(partsA[i] || 0, 10);
      const numB = parseInt(partsB[i] || 0, 10);
      
      if (numA > numB) return -1;  // Higher version first
      if (numA < numB) return 1;   // Lower version later
    }
    
    return 0; // Equal versions
  }

  /**
   * Fetch versions from the GitHub API
   * @returns {Promise<Array>} Array of version objects
   */
  async fetchVersions() {
    try {
      // Extract repo owner and name from the URL
      const repoPath = new URL(this.repoUrl).pathname;
      const [, owner, repo] = repoPath.split('/');
      
      if (!owner || !repo) {
        throw new Error('Could not parse repository information');
      }
      
      // Get tags from GitHub API
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/tags`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      const tags = await response.json();
      
      // Transform and sort tags
      return tags
        .map(tag => ({
          version: tag.name,
          title: tag.name
        }))
        .sort((a, b) => this._compareVersions(a.version, b.version));
    } catch (error) {
      console.error('Error fetching tags:', error);
      
      // Fallback to hardcoded versions if fetch fails
      return this.getFallbackVersions();
    }
  }

  /**
   * Get the current version from the URL or null if not found
   * @param {Array} versions Available versions
   * @returns {string|null} Current version or null
   */
  getCurrentVersion(versions) {
    if (!versions || versions.length === 0) {
      return null;
    }
    
    // Try to extract version from URL
    const pathMatch = window.location.pathname.match(/\/v\d+\.\d+\.\d+\//);
    if (pathMatch) {
      return pathMatch[0].replace(/\//g, '');
    }
    
    // Default to latest version
    return versions[0].version;
  }

  /**
   * Get fallback versions if GitHub API fails
   * @returns {Array} Array of version objects
   */
  getFallbackVersions() {
    return [
      { version: 'v0.1.4', title: 'v0.1.4' },
      { version: 'v0.1.3', title: 'v0.1.3' },
      { version: 'v0.1.2', title: 'v0.1.2' },
      { version: 'v0.1.1', title: 'v0.1.1' },
      { version: 'v0.1.0', title: 'v0.1.0' },
      { version: 'v0.0.7', title: 'v0.0.7' },
      { version: 'v0.0.6', title: 'v0.0.6' },
      { version: 'v0.0.5', title: 'v0.0.5' },
      { version: 'v0.0.4', title: 'v0.0.4' },
      { version: 'v0.0.3', title: 'v0.0.3' },
      { version: 'v0.0.2', title: 'v0.0.2' },
      { version: 'v0.0.1', title: 'v0.0.1' }
    ];
  }
}