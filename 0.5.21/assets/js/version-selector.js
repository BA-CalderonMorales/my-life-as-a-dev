/**
 * Custom version selector for Zensical-built sites.
 * Fetches versions.json and renders a dropdown in the header.
 */
(function () {
  'use strict';

  // Find the base URL (repo root, without version segment)
  // For GitHub Pages: /repo-name/ (versions.json lives here)
  // For versioned paths like /repo-name/0.3.0/ -> returns /repo-name/
  function getBaseUrl() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    // GitHub Pages structure: /repo-name/version/page
    // We want just /repo-name/
    if (parts.length >= 1) {
      return '/' + parts[0] + '/';
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
      const payload = await response.json();
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.versions)) return payload.versions;
      return null;
    } catch (e) {
      // Silently fail - version selector is optional
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

  // Get the current page path relative to the version root
  function getRelativePath() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    // Path structure: /repo-name/version/page/subpage
    // We want page/subpage
    if (parts.length >= 3) {
      return parts.slice(2).join('/') + '/';
    }
    // Handle edge case where we might be at a file like /repo-name/version/page.html
    // The split logic above assumes directories mostly, let's refine if needed.
    // For now, let's stick to the current logic which seems to assume directory-based URLs 
    // (standard for MkDocs).
    
    return '';
  }

  // Create version selector dropdown
  function createVersionSelector(versions) {
    const currentVersion = getCurrentVersion();
    const baseUrl = getBaseUrl();
    const relativePath = getRelativePath();

    // Create container
    const container = document.createElement('div');
    container.className = 'md-version';
    container.innerHTML = `
      <button class="md-version__current" type="button" aria-label="Select version" aria-expanded="false">
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
      const targetUrl = baseUrl + v.version + '/' + relativePath;
      const fallbackUrl = baseUrl + v.version + '/';
      const isActiveVersion = v.version === currentVersion || (v.aliases && v.aliases.includes(currentVersion));

      // The actual href should always be a valid version landing page so
      // long-press, open-in-new-tab, and JS failure paths still work.
      a.href = fallbackUrl;
      a.dataset.targetUrl = targetUrl;
      a.className = 'md-version__link';

      let label = v.title || v.version;
      if (v.aliases && v.aliases.length > 0) {
        label += ` (${v.aliases.join(', ')})`;
      }
      a.textContent = label;

      if (isActiveVersion) {
        li.classList.add('md-version__item--active');
        a.setAttribute('aria-current', 'page');
      }

      // Check if page exists in target version before navigating
      a.addEventListener('click', function (e) {
        e.stopPropagation();

        // Always allow same-version navigation to use the real anchor href.
        if (isActiveVersion || !relativePath) return;

        e.preventDefault();
        fetch(targetUrl, { method: 'HEAD' })
          .then(function (resp) {
            if (resp.ok) {
              window.location.assign(targetUrl);
            } else {
              window.location.assign(fallbackUrl);
            }
          })
          .catch(function () {
            window.location.assign(fallbackUrl);
          });
      });

      li.appendChild(a);
      list.appendChild(li);
    });

    // Toggle dropdown - support both click and touch for mobile
    function toggleDropdown(e) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = container.classList.toggle('md-version--active');
      button.setAttribute('aria-expanded', String(isOpen));
    }
    
    button.addEventListener('click', toggleDropdown);
    button.addEventListener('touchend', toggleDropdown, { passive: false });

    // Close on outside click/touch
    function handleOutsideInteraction(e) {
      if (container.contains(e.target)) return;
      container.classList.remove('md-version--active');
      button.setAttribute('aria-expanded', 'false');
    }
    
    document.addEventListener('click', handleOutsideInteraction);
    document.addEventListener('touchend', handleOutsideInteraction, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      container.classList.remove('md-version--active');
      button.setAttribute('aria-expanded', 'false');
    });
    
    // Close dropdown when scrolling (mobile UX improvement)
    window.addEventListener('scroll', () => {
      if (container.classList.contains('md-version--active')) {
        container.classList.remove('md-version--active');
        button.setAttribute('aria-expanded', 'false');
      }
    }, { passive: true });

    return container;
  }

  // Check if current version is latest
  function isLatestVersion(versions, currentVersion) {
    if (!versions || versions.length === 0) return true;
    const latest = versions.find(v => v.aliases && v.aliases.includes('latest'));
    if (!latest) return true;  // No latest defined, assume current is latest
    return latest.version === currentVersion || currentVersion === 'latest';
  }

  // Create "back to latest" banner
  function createLatestBanner(versions, currentVersion) {
    const latest = versions.find(v => v.aliases && v.aliases.includes('latest'));
    if (!latest) return null;

    const baseUrl = getBaseUrl();
    const banner = document.createElement('div');
    banner.className = 'md-version-banner';
    banner.innerHTML = `
      <div class="md-version-banner__content">
        <span class="md-version-banner__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" fill="currentColor"/>
          </svg>
        </span>
        <span>You are viewing an older version (<strong>${currentVersion}</strong>). </span>
        <a href="${baseUrl}latest/" class="md-version-banner__link">View latest (${latest.version})</a>
      </div>
    `;
    return banner;
  }

  // Add styles
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .md-version-banner {
        background: var(--mlad-surface-solid, #f5f4ee);
        color: var(--md-default-fg-color, #111);
        padding: 0.6rem 1rem;
        text-align: center;
        font-size: 0.85rem;
        position: sticky;
        top: 0;
        z-index: 90;
        border-bottom: 1px solid var(--mlad-border-strong, rgba(0, 0, 0, 0.16));
      }
      .md-version-banner__content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .md-version-banner__icon {
        display: flex;
        align-items: center;
      }
      .md-version-banner__link {
        color: inherit;
        font-weight: bold;
        text-decoration: underline;
        margin-left: 0.25rem;
      }
      .md-version-banner__link:hover {
        text-decoration: none;
      }
      .md-version {
        position: relative;
        margin-left: 0.4rem;
        font-size: 0.7rem;
        z-index: 100;
      }
      .md-version__current {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.5rem 0.4rem 0.7rem;
        background: var(--mlad-surface-elevated, #fff);
        border: 1px solid var(--mlad-border-strong, rgba(0, 0, 0, 0.16));
        border-radius: 0;
        color: var(--md-default-fg-color, #111);
        cursor: pointer;
        font-size: 0.7rem;
        font-family: inherit;
        font-weight: 600;
        transition: all 0.2s ease;
        white-space: nowrap;
        box-shadow: var(--mlad-shadow-button, 3px 3px 0 rgba(0, 0, 0, 0.12));
      }
      .md-version__current:hover {
        background: var(--mlad-button-secondary-bg, #eceae3);
        box-shadow: var(--mlad-shadow-button-hover, 5px 5px 0 rgba(0, 0, 0, 0.16));
      }
      .md-version__current svg {
        width: 14px;
        height: 14px;
        opacity: 1;
        transition: transform 0.2s ease;
        flex-shrink: 0;
      }
      .md-version--active .md-version__current {
        background: var(--mlad-button-secondary-bg, #eceae3);
      }
      .md-version--active .md-version__current svg {
        transform: rotate(180deg);
      }
      .md-version__list {
        position: absolute;
        top: calc(100% + 0.25rem);
        right: 0;
        margin: 0;
        padding: 0.5rem 0;
        background: var(--mlad-surface-solid, var(--md-default-bg-color, white));
        border-radius: 0;
        box-shadow: var(--mlad-shadow-soft, 8px 8px 0 rgba(0, 0, 0, 0.08));
        list-style: none;
        min-width: 11rem;
        max-height: 20rem;
        overflow-y: auto;
        display: none;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        z-index: 101;
        border: 1px solid var(--mlad-border-strong, rgba(0, 0, 0, 0.16));
        /* Mobile WebView fixes */
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
      }
      .md-version--active .md-version__list {
        display: block;
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
      .md-version__item {
        position: relative;
        opacity: 1;
      }
      .md-version__link {
        display: block;
        padding: 0.5rem 1rem;
        color: var(--md-default-fg-color, black);
        background: transparent;
        text-decoration: none;
        font-size: 0.8rem;
        opacity: 1;
        pointer-events: auto;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .md-version__link:hover {
        background: var(--mlad-button-secondary-bg, rgba(0, 0, 0, 0.05));
      }
      .md-version__item--active .md-version__link {
        font-weight: 600;
        color: var(--md-default-fg-color, #111);
        background: var(--mlad-button-secondary-bg, rgba(0, 0, 0, 0.05));
      }
      /* Responsive: Mobile */
      @media screen and (max-width: 30rem) {
        .md-version {
          margin-left: 0.25rem;
          z-index: 200;
        }
        .md-version__current {
          padding: 0.35rem 0.4rem 0.35rem 0.6rem;
          font-size: 0.65rem;
          gap: 0.25rem;
          /* Ensure touch targets are large enough */
          min-height: 44px;
          min-width: 44px;
        }
        .md-version__current svg {
          width: 12px;
          height: 12px;
        }
        .md-version__list {
          min-width: 9rem;
          right: -0.5rem;
          z-index: 201;
          /* Mobile: ensure dropdown is above everything */
          position: fixed;
          top: auto;
          margin-top: 0.5rem;
        }
        .md-version__link {
          padding: 0.75rem;
          font-size: 0.75rem;
          /* Larger touch targets on mobile */
          min-height: 44px;
          display: flex;
          align-items: center;
        }
      }
      /* Responsive: Tablet */
      @media screen and (min-width: 30rem) and (max-width: 60rem) {
        .md-version__current {
          padding: 0.38rem 0.45rem 0.38rem 0.65rem;
        }
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

    const currentVersion = getCurrentVersion();

    // Show banner if not on latest version
    if (!isLatestVersion(versions, currentVersion)) {
      const banner = createLatestBanner(versions, currentVersion);
      if (banner) {
        document.body.insertBefore(banner, document.body.firstChild);
      }
    }

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
