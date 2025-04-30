/**
 * VersionSelectorUI
 * 
 * Handles creating and rendering the version selector UI elements
 */
export class VersionSelectorUI {
  constructor() {
    this.selectId = 'version-selector';
    this.contentCache = new Map(); // Cache for fetched content
  }

  /**
   * Check if the app is running in a local development environment
   * @returns {boolean} True if in local development
   */
  _isLocalDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('app.github.dev');
  }

  /**
   * Create the version selector dropdown element
   * @param {Array} versions List of available versions
   * @param {string|null} currentVersion Currently active version
   * @returns {HTMLSelectElement} The select element
   */
  _createSelectElement(versions, currentVersion) {
    // Create the select element
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Version');
    
    // Add placeholder option
    const placeholder = document.createElement('option');
    placeholder.disabled = true;
    placeholder.value = '';
    placeholder.text = 'Version';
    placeholder.selected = true;
    select.appendChild(placeholder);
    
    // Add latest option
    const latestOption = document.createElement('option');
    latestOption.value = versions[0].version;
    latestOption.text = `${versions[0].version} (latest)`;
    latestOption.selected = currentVersion === versions[0].version;
    select.appendChild(latestOption);
    
    // Add options for each remaining version
    for (let i = 1; i < versions.length; i++) {
      const option = document.createElement('option');
      option.value = versions[i].version;
      option.text = versions[i].title;
      option.selected = versions[i].version === currentVersion;
      select.appendChild(option);
    }

    return select;
  }

  /**
   * Create the version selector container
   * @returns {HTMLDivElement} The container element
   */
  _createContainer() {
    // Create the dropdown container
    const versionSelector = document.createElement('div');
    versionSelector.id = this.selectId;
    versionSelector.className = 'md-version-select';
    
    return versionSelector;
  }

  /**
   * Handle version selection change
   * @param {Event} event The change event
   * @param {string} baseUrl Base URL for navigation
   */
  _handleVersionChange(event, baseUrl) {
    const selectedVersion = event.target.value;
    
    // Local development handling - actually load the version
    if (this._isLocalDevelopment()) {
      console.log(`Local development: Loading version ${selectedVersion}`);
      
      // Store selected version in localStorage for persistence
      localStorage.setItem('selectedVersion', selectedVersion);
      
      // Show a notification to the user
      this._showNotification(`Loading version ${selectedVersion}...`);
      
      // Actually fetch and display content from the selected version
      this._loadVersionContent(selectedVersion);
      
      return;
    }
    
    // Production - navigate to the selected version
    const newUrl = `${baseUrl}${selectedVersion}/`;
    window.location.href = newUrl;
  }

  /**
   * Load content from the selected version
   * @param {string} version The version to load
   */
  async _loadVersionContent(version) {
    try {
      // Create or update version banner
      this._createVersionBanner(version);
      
      // Get the repository information
      const repoUrl = document.querySelector('meta[name="repo-url"]')?.content 
        || document.querySelector('link[rel="repository"]')?.href
        || 'https://github.com/BA-CalderonMorales/my-life-as-a-dev';
      
      // Extract repo owner and name
      const repoPath = new URL(repoUrl).pathname;
      const [, owner, repo] = repoPath.split('/');
      
      if (!owner || !repo) {
        throw new Error('Could not parse repository information');
      }
      
      // Check if content for this version is cached
      if (!this.contentCache.has(version)) {
        // Show loading indicator
        this._showLoadingIndicator(true);
        
        // Fetch content from GitHub for the specific version/tag
        const currentPath = window.location.pathname.replace(/^\/[^/]+\//, '');
        const filePath = currentPath === '/' ? 'docs/index.md' : `docs/${currentPath}index.md`;
        
        // Use GitHub's raw content URL to fetch the file at the specific version
        const contentUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${version}/${filePath}`;
        
        try {
          const response = await fetch(contentUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.status}`);
          }
          
          const content = await response.text();
          
          // Cache the content
          this.contentCache.set(version, content);
        } catch (error) {
          console.error('Error fetching content:', error);
          this._showNotification(`Error loading version ${version}: ${error.message}`);
          this._showLoadingIndicator(false);
          return;
        }
      }
      
      // Get content from cache
      const content = this.contentCache.get(version);
      
      // Replace the current content with the fetched content
      this._replacePageContent(content, version);
      
      // Hide loading indicator
      this._showLoadingIndicator(false);
      
      // Apply styling changes based on version
      this._applyVersionStyling(version);
      
      // Update history state to maintain browser navigation
      window.history.pushState(
        { version }, 
        document.title, 
        window.location.pathname + `?version=${version}`
      );
      
    } catch (error) {
      console.error('Error loading version:', error);
      this._showNotification(`Error: ${error.message}`);
    }
  }

  /**
   * Show or hide the loading indicator
   * @param {boolean} show Whether to show or hide the indicator
   */
  _showLoadingIndicator(show) {
    let loadingIndicator = document.getElementById('version-loading');
    
    if (show) {
      if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'version-loading';
        loadingIndicator.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        `;
        
        const spinner = document.createElement('div');
        spinner.className = 'version-loading-spinner';
        loadingIndicator.appendChild(spinner);
        
        document.body.appendChild(loadingIndicator);
      }
    } else if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }

  /**
   * Replace the current page content with the fetched content
   * @param {string} content The markdown content
   * @param {string} version The version being displayed
   */
  _replacePageContent(content, version) {
    try {
      // Find the main content container
      const mainContent = document.querySelector('.md-content__inner');
      if (!mainContent) {
        throw new Error('Could not find content container');
      }
      
      // Store the original content if this is the first version change
      if (!mainContent.hasAttribute('data-original-content')) {
        mainContent.setAttribute('data-original-content', mainContent.innerHTML);
      }
      
      // Create an iframe to safely render the markdown content
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'border: none; width: 100%; height: 500px; margin-top: 20px;';
      iframe.title = `Version ${version} content`;
      
      // Set version in iframe for reference
      iframe.setAttribute('data-version', version);
      
      // Append iframe to a temporary div
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(iframe);
      
      // Replace the main content with our iframe
      mainContent.innerHTML = '';
      mainContent.appendChild(iframe);
      
      // Once the iframe is loaded, write the content to it
      iframe.onload = () => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Add a header to indicate this is historic content
        const versionHeader = document.createElement('div');
        versionHeader.style.cssText = 'background-color: #ffab40; padding: 10px; margin-bottom: 20px; border-radius: 4px;';
        versionHeader.innerHTML = `<strong>Viewing content from version ${version}</strong>`;
        
        // Add styles and content
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Version ${version}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
                line-height: 1.6;
                padding: 1rem;
                color: ${document.documentElement.dataset.mdColorScheme === 'slate' ? '#eee' : '#333'};
                background: ${document.documentElement.dataset.mdColorScheme === 'slate' ? '#1e1e2e' : '#fff'};
              }
              pre {
                background: ${document.documentElement.dataset.mdColorScheme === 'slate' ? '#2d2d44' : '#f6f8fa'};
                padding: 1rem;
                border-radius: 4px;
                overflow-x: auto;
              }
              code {
                font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
              }
              a { color: #3d73e5; }
              h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
              h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
              h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
              h3 { font-size: 1.25em; }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            ${versionHeader.outerHTML}
            <div class="markdown-content">
              ${this._convertMarkdownToHtml(content)}
            </div>
          </body>
          </html>
        `);
        iframeDoc.close();
        
        // Adjust iframe height to match content
        setTimeout(() => {
          iframe.style.height = (iframeDoc.body.scrollHeight + 20) + 'px';
        }, 100);
      };
      
    } catch (error) {
      console.error('Error replacing content:', error);
      this._showNotification(`Error displaying content: ${error.message}`);
    }
  }
  
  /**
   * Convert markdown to HTML using a simple regex-based approach
   * This is not a full markdown parser but handles basic formatting
   * @param {string} markdown The markdown content
   * @returns {string} HTML content
   */
  _convertMarkdownToHtml(markdown) {
    // Very basic markdown to HTML conversion
    let html = markdown
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Headers
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^#### (.*?)$/gm, '<h4>$1</h4>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // Lists
      .replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li>$1</li>')
      // Paragraphs
      .replace(/(?:^|\n\n)((?!<h|<pre|<ul|<li|<p).*?)(?=\n\n|$)/gs, '<p>$1</p>');

    return html;
  }

  /**
   * Create or update the version banner
   * @param {string} version The version being displayed
   */
  _createVersionBanner(version) {
    // Create or update version banner
    let versionBanner = document.getElementById('version-banner');
    
    if (!versionBanner) {
      versionBanner = document.createElement('div');
      versionBanner.id = 'version-banner';
      
      // Insert after header or at beginning of body
      const header = document.querySelector('.md-header');
      if (header) {
        header.parentNode.insertBefore(versionBanner, header.nextSibling);
      } else {
        document.body.insertBefore(versionBanner, document.body.firstChild);
      }
    }
    
    // Add close button to banner
    versionBanner.innerHTML = `
      Viewing version: ${version}
      <button id="reset-version" style="margin-left: 15px; background: transparent; border: 1px solid; border-radius: 3px; padding: 0 5px; cursor: pointer;">
        Reset to latest
      </button>
    `;
    
    // Add event listener to reset button
    document.getElementById('reset-version').addEventListener('click', () => {
      localStorage.removeItem('selectedVersion');
      this._showNotification('Resetting to latest version...');
      
      // Restore original content if available
      const mainContent = document.querySelector('.md-content__inner');
      if (mainContent && mainContent.hasAttribute('data-original-content')) {
        mainContent.innerHTML = mainContent.getAttribute('data-original-content');
      }
      
      // Remove version banner
      versionBanner.remove();
      
      // Reset URL
      window.history.pushState({}, document.title, window.location.pathname);
      
      setTimeout(() => {
        window.location.reload();
      }, 300);
    });
  }

  /**
   * Apply styling changes based on version
   * @param {string} version The version to style for
   */
  _applyVersionStyling(version) {
    // Apply styling changes based on version
    document.documentElement.setAttribute('data-version', version);
    
    // Apply additional visual changes based on version number
    const versionNumber = version.replace(/\D/g, '').split('.').map(Number);
    
    // Older versions get a slightly different visual style
    if (versionNumber[0] === 0 && versionNumber[1] <= 1 && versionNumber[2] < 3) {
      // Simulate older styling for versions before v0.1.3
      document.body.classList.add('legacy-version');
      
      const style = document.createElement('style');
      style.textContent = `
        .legacy-version .md-header {
          background-color: #455a64 !important;
        }
        .legacy-version .md-typeset h1 {
          color: #455a64;
          font-weight: normal;
        }
        .legacy-version [data-md-color-scheme="slate"] .md-typeset h1 {
          color: #b0bec5;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Check if a version is selected in the URL query parameters
   * @returns {string|null} The selected version or null if not found
   */
  _getVersionFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('version');
  }

  /**
   * Find the target element to append the version selector to
   * @returns {HTMLElement|null} The target element or null if not found
   */
  _findTargetElement() {
    return document.querySelector('.md-header__title');
  }

  /**
   * Render the version selector in the DOM
   * @param {Array} versions List of versions to display
   * @param {string|null} currentVersion Currently active version
   * @param {string} baseUrl Base URL for navigation
   */
  render(versions, currentVersion, baseUrl) {
    // Check if we have versions and if selector already exists
    if (!versions || versions.length === 0 || document.getElementById(this.selectId)) {
      return;
    }
    
    // Check query parameters for version
    const urlVersion = this._getVersionFromUrl();
    
    // Check if we have a saved version in localStorage (for local development)
    const savedVersion = urlVersion || localStorage.getItem('selectedVersion');
    if (savedVersion && this._isLocalDevelopment()) {
      // Load the content for the saved version
      setTimeout(() => this._loadVersionContent(savedVersion), 300);
    }
    
    // Create container
    const container = this._createContainer();
    
    // Create select element
    const select = this._createSelectElement(versions, savedVersion || currentVersion);
    
    // Add event listener
    select.addEventListener('change', (event) => this._handleVersionChange(event, baseUrl));
    
    // Add select to container
    container.appendChild(select);
    
    // Add to DOM
    const targetElement = this._findTargetElement();
    if (targetElement) {
      targetElement.after(container);
      console.log('Version selector rendered successfully');
    } else {
      console.error('Could not find target element to render version selector');
    }
  }
}