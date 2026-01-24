/**
 * Custom version selector for Zensical-built sites.
 * Fetches versions.json and renders a dropdown in the header.
 */
(function() {
  'use strict';

  // Find the base URL (handles versioned paths like /0.1.39/ or /latest/)
  function getBaseUrl() {
    const path = window.location.pathname;
    const match = path.match(/^(\/[^\/]+\/[^\/]+\/)/);  // e.g., /my-life-as-a-dev/latest/
    if (match) {
      // Go up to the repo root (slice 0-2 gives ['', 'repo-name'])
      return path.split('/').slice(0, 2).join('/') + '/';
    }
    return '/';
  }

  // Fetch versions.json
  async function fetchVersions() {
    const baseUrl = getBaseUrl();
    const versionsUrl = baseUrl + 'versions.json';

    try {
      const response = await fetch(versionsUrl);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn('Could not fetch versions.json:', e);
      return null;
    }
  }

  // Get current version from URL
  function getCurrentVersion() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    // Path structure: /repo-name/version/page
    if (parts.length >= 2) {
      return parts[1];  // e.g., "latest" or "0.1.39"
    }
    return null;
  }

  // Create version selector dropdown
  function createVersionSelector(versions) {
    const currentVersion = getCurrentVersion();
    const baseUrl = getBaseUrl();

    // Create container
    const container = document.createElement('div');
    container.className = 'md-version';
    container.innerHTML = `
      <button class="md-version__current" aria-label="Select version">
        <span class="md-version__label">${currentVersion || 'Version'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path d="M7 10l5 5 5-5z" fill="currentColor"/>
        </svg>
      </button>
      <ul class="md-version__list"></ul>
    `;

    const list = container.querySelector('.md-version__list');
    const button = container.querySelector('.md-version__current');

    // Populate version list
    versions.forEach(v => {
      const li = document.createElement('li');
      li.className = 'md-version__item';

      const a = document.createElement('a');
      a.href = baseUrl + v.version + '/';
      a.className = 'md-version__link';

      let label = v.title || v.version;
      if (v.aliases && v.aliases.length > 0) {
        label += ` (${v.aliases.join(', ')})`;
      }
      a.textContent = label;

      if (v.version === currentVersion || (v.aliases && v.aliases.includes(currentVersion))) {
        li.classList.add('md-version__item--active');
      }

      li.appendChild(a);
      list.appendChild(li);
    });

    // Toggle dropdown
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('md-version--active');
    });

    // Close on outside click
    document.addEventListener('click', () => {
      container.classList.remove('md-version--active');
    });

    return container;
  }

  // Add styles
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .md-version {
        position: relative;
        margin-left: 0.4rem;
        font-size: 0.8rem;
      }
      .md-version__current {
        display: flex;
        align-items: center;
        gap: 0.2rem;
        padding: 0.4rem 0.6rem;
        background: var(--md-primary-fg-color--light, rgba(0,0,0,0.1));
        border: none;
        border-radius: 0.2rem;
        color: var(--md-primary-bg-color, white);
        cursor: pointer;
        font-size: inherit;
        font-family: inherit;
      }
      .md-version__current:hover {
        background: var(--md-primary-fg-color--dark, rgba(0,0,0,0.2));
      }
      .md-version__list {
        position: absolute;
        top: 100%;
        right: 0;
        margin: 0.2rem 0 0;
        padding: 0.4rem 0;
        background: var(--md-default-bg-color, white);
        border-radius: 0.2rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        list-style: none;
        min-width: 10rem;
        max-height: 20rem;
        overflow-y: auto;
        display: none;
        z-index: 100;
      }
      .md-version--active .md-version__list {
        display: block;
      }
      .md-version__link {
        display: block;
        padding: 0.4rem 0.8rem;
        color: var(--md-default-fg-color, black);
        text-decoration: none;
      }
      .md-version__link:hover {
        background: var(--md-accent-fg-color--transparent, rgba(0,0,0,0.05));
      }
      .md-version__item--active .md-version__link {
        font-weight: bold;
        color: var(--md-accent-fg-color, #448aff);
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize
  async function init() {
    const versions = await fetchVersions();
    if (!versions || !Array.isArray(versions) || versions.length === 0) {
      return;  // No versions, don't show selector
    }

    addStyles();

    // Wait for header to be available
    const observer = new MutationObserver((mutations, obs) => {
      const header = document.querySelector('.md-header__inner');
      const existingSelector = document.querySelector('.md-version');

      if (header && !existingSelector) {
        const nav = header.querySelector('.md-header__source') || header.querySelector('.md-header__title');
        if (nav) {
          const selector = createVersionSelector(versions);
          nav.parentNode.insertBefore(selector, nav);
          obs.disconnect();
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also try immediately
    const header = document.querySelector('.md-header__inner');
    if (header) {
      const nav = header.querySelector('.md-header__source') || header.querySelector('.md-header__title');
      if (nav && !document.querySelector('.md-version')) {
        const selector = createVersionSelector(versions);
        nav.parentNode.insertBefore(selector, nav);
        observer.disconnect();
      }
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
