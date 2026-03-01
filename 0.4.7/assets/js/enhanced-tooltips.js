/**
 * Enhanced Tooltips Module
 * 
 * Adds custom styled tooltips to interactive elements across the site.
 * Uses a custom tooltip implementation to avoid double-tooltip issues
 * with native browser tooltips.
 * 
 * IMPORTANT: Tooltips only appear when text is truncated (ellipsis visible).
 * This prevents unnecessary tooltips on fully-visible text.
 * 
 * Covered elements:
 * - Sidebar navigation links (shows full text when truncated)
 * - Header navigation tabs (when truncated)
 * - Action buttons (edit, view source, etc.) - icons only
 * - Social links - icons only
 * - Theme toggle
 * - Search button
 * - TOC links (when truncated)
 */

(function () {
    'use strict';

    // Tooltip element (singleton)
    let tooltipEl = null;
    let hideTimeout = null;

    /**
     * Check if an element's text is truncated (has ellipsis)
     * Returns true if the element's content overflows and is clipped
     */
    function isTextTruncated(element) {
        if (!element) return false;

        // Check for .md-ellipsis child first (MkDocs Material pattern)
        const ellipsisSpan = element.querySelector('.md-ellipsis');
        const targetElement = ellipsisSpan || element;

        // Text is truncated if scrollWidth > clientWidth
        return targetElement.scrollWidth > targetElement.clientWidth;
    }

    /**
     * Create the tooltip element if it doesn't exist
     */
    function ensureTooltipElement() {
        if (tooltipEl) return tooltipEl;

        tooltipEl = document.createElement('div');
        tooltipEl.className = 'custom-tooltip';
        tooltipEl.setAttribute('role', 'tooltip');
        tooltipEl.style.cssText = `
            position: fixed;
            z-index: 9999;
            padding: 0.4rem 0.65rem;
            font-size: 0.7rem;
            font-weight: 500;
            color: var(--md-default-bg-color, #fff);
            background: var(--md-default-fg-color, #333);
            border-radius: 0.25rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            pointer-events: none;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 0.15s ease, transform 0.15s ease;
            white-space: nowrap;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        document.body.appendChild(tooltipEl);
        return tooltipEl;
    }

    /**
     * Show tooltip near an element
     */
    function showTooltip(element, text) {
        if (!text) return;

        clearTimeout(hideTimeout);
        const tooltip = ensureTooltipElement();
        tooltip.textContent = text;

        // Position the tooltip
        const rect = element.getBoundingClientRect();

        // Default: below the element, centered
        let top = rect.bottom + 8;
        let left = rect.left + (rect.width / 2);

        // Make tooltip visible to measure
        tooltip.style.opacity = '0';
        tooltip.style.display = 'block';
        tooltip.style.transform = 'translateX(-50%) translateY(4px)';

        // Check right edge
        const tooltipWidth = tooltip.offsetWidth;
        if (left + tooltipWidth / 2 > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth / 2 - 10;
        }
        // Check left edge
        if (left - tooltipWidth / 2 < 10) {
            left = tooltipWidth / 2 + 10;
        }
        // Check bottom edge - show above if needed
        if (top + tooltip.offsetHeight > window.innerHeight - 10) {
            top = rect.top - tooltip.offsetHeight - 8;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.style.transform = 'translateX(-50%) translateY(0)';
        tooltip.style.opacity = '1';
    }

    /**
     * Hide tooltip
     */
    function hideTooltip() {
        if (!tooltipEl) return;
        tooltipEl.style.opacity = '0';
        tooltipEl.style.transform = 'translateX(-50%) translateY(4px)';
        hideTimeout = setTimeout(function () {
            if (tooltipEl) {
                tooltipEl.style.display = 'none';
            }
        }, 150);
    }

    /**
     * Add tooltip behavior to an element
     * @param {HTMLElement} element - The element to add tooltip to
     * @param {string} text - The tooltip text
     * @param {boolean} checkTruncation - If true, only show tooltip when text is truncated
     */
    function addTooltip(element, text, checkTruncation) {
        if (!element || !text) return;

        // Skip if already has tooltip set up
        if (element.hasAttribute('data-custom-tooltip')) return;

        // Mark as having tooltip
        element.setAttribute('data-custom-tooltip', text);

        // Store whether this tooltip requires truncation check
        if (checkTruncation) {
            element.setAttribute('data-tooltip-truncation-check', 'true');
        }

        // Remove native title to prevent double tooltips
        if (element.hasAttribute('title')) {
            element.removeAttribute('title');
        }

        // Add event listeners
        element.addEventListener('mouseenter', function () {
            // If truncation check is required, only show if text is actually truncated
            if (this.hasAttribute('data-tooltip-truncation-check')) {
                if (!isTextTruncated(this)) {
                    return; // Text fits, no tooltip needed
                }
            }
            const tooltipText = this.getAttribute('data-custom-tooltip');
            showTooltip(this, tooltipText);
        });

        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', function () {
            // If truncation check is required, only show if text is actually truncated
            if (this.hasAttribute('data-tooltip-truncation-check')) {
                if (!isTextTruncated(this)) {
                    return; // Text fits, no tooltip needed
                }
            }
            const tooltipText = this.getAttribute('data-custom-tooltip');
            showTooltip(this, tooltipText);
        });
        element.addEventListener('blur', hideTooltip);
    }

    /**
     * Remove native title attributes from navigation elements
     * to prevent browser's default tooltips from showing
     */
    function removeNativeTitles() {
        // Remove titles from all nav links
        const navLinks = document.querySelectorAll('.md-nav__link, .md-tabs__link');
        navLinks.forEach(function (link) {
            if (link.hasAttribute('title')) {
                link.removeAttribute('title');
            }
        });
    }

    /**
     * Add tooltips to sidebar navigation links
     * Only shows tooltip when text is truncated (ellipsis visible)
     */
    function addNavTooltips() {
        // First, remove all native titles to prevent double tooltips
        removeNativeTitles();

        const navLinks = document.querySelectorAll('.md-sidebar--primary .md-nav__link');

        navLinks.forEach(function (link) {
            const ellipsisSpan = link.querySelector('.md-ellipsis');
            const text = ellipsisSpan ? ellipsisSpan.textContent.trim() : link.textContent.trim();

            if (text) {
                // Pass true to enable truncation checking
                addTooltip(link, text, true);
            }
        });
    }

    /**
     * Add tooltips to header tabs
     * Only shows tooltip when text is truncated
     */
    function addTabTooltips() {
        const tabs = document.querySelectorAll('.md-tabs__link');
        tabs.forEach(function (tab) {
            const text = tab.textContent.trim();
            if (text) {
                // Pass true to enable truncation checking
                addTooltip(tab, text, true);
            }
        });
    }

    /**
     * Add tooltips to action buttons (edit, view source, etc.)
     * Icons always get tooltips since they have no visible text
     */
    function addActionButtonTooltips() {
        // Edit and view source buttons
        const actionButtons = document.querySelectorAll('.md-content__button');
        actionButtons.forEach(function (btn) {
            const text = btn.getAttribute('title') || btn.getAttribute('aria-label') || btn.textContent.trim();
            if (text) {
                // Icons always need tooltips - no truncation check
                addTooltip(btn, text, false);
            }
        });

        // Copy code buttons
        const copyButtons = document.querySelectorAll('.md-clipboard');
        copyButtons.forEach(function (btn) {
            // Icons always need tooltips - no truncation check
            addTooltip(btn, 'Copy to clipboard', false);
        });
    }

    /**
     * Add tooltips to header icons and buttons
     * Icons always get tooltips since they have no visible text
     */
    function addHeaderTooltips() {
        // Search button
        const searchBtn = document.querySelector('.md-search__icon');
        if (searchBtn && !searchBtn.hasAttribute('data-custom-tooltip')) {
            // Icons always need tooltips - no truncation check
            addTooltip(searchBtn, 'Search', false);
        }

        // Theme toggle buttons/labels
        const themeLabels = document.querySelectorAll('[data-md-component="palette"] label');
        themeLabels.forEach(function (label) {
            if (label.hasAttribute('data-custom-tooltip')) return;
            const forInput = document.getElementById(label.getAttribute('for'));
            if (forInput) {
                const scheme = forInput.getAttribute('data-md-color-scheme');
                const text = scheme === 'slate' ? 'Switch to dark mode' : 'Switch to light mode';
                // Icons always need tooltips - no truncation check
                addTooltip(label, text, false);
            }
        });

        // Repository link
        const repoLink = document.querySelector('.md-source');
        if (repoLink && !repoLink.hasAttribute('data-custom-tooltip')) {
            // Icons always need tooltips - no truncation check
            addTooltip(repoLink, 'View source repository', false);
        }
    }

    /**
     * Add tooltips to social links
     * Icons always get tooltips (no text visible)
     */
    function addSocialTooltips() {
        const socialLinks = document.querySelectorAll('.md-social__link');
        socialLinks.forEach(function (link) {
            const text = link.getAttribute('title') || link.getAttribute('aria-label');
            if (text) {
                // Icons always need tooltips - no truncation check
                addTooltip(link, text, false);
            }
        });
    }

    /**
     * Add tooltips to TOC (table of contents) links
     * Only shows tooltip when text is truncated
     */
    function addTocTooltips() {
        const tocLinks = document.querySelectorAll('.md-nav--secondary .md-nav__link');
        tocLinks.forEach(function (link) {
            const ellipsisSpan = link.querySelector('.md-ellipsis');
            const text = ellipsisSpan ? ellipsisSpan.textContent.trim() : link.textContent.trim();
            if (text) {
                // Pass true to enable truncation checking
                addTooltip(link, text, true);
            }
        });
    }

    /**
     * Apply all tooltips
     */
    function applyAllTooltips() {
        addNavTooltips();
        addTabTooltips();
        addActionButtonTooltips();
        addHeaderTooltips();
        addSocialTooltips();
        addTocTooltips();
    }

    /**
     * Check if the device is mobile or tablet
     * Uses multiple detection methods for reliability
     */
    function isMobileOrTablet() {
        // Check for touch-primary device (most reliable for mobile/tablet)
        if (window.matchMedia('(pointer: coarse)').matches) {
            return true;
        }

        // Check for common mobile/tablet screen widths (up to 1024px for tablets)
        if (window.matchMedia('(max-width: 1024px)').matches) {
            return true;
        }

        // Check for touch capability combined with no fine pointer
        if ('ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches) {
            return true;
        }

        return false;
    }

    /**
     * Initialize tooltips when DOM is ready
     */
    function init() {
        // Completely disable tooltips on mobile and tablet devices
        if (isMobileOrTablet()) {
            return;
        }

        // Initial application
        applyAllTooltips();

        // Re-apply after navigation (for SPA-style navigation)
        document.addEventListener('DOMContentLoaded', applyAllTooltips);

        // Listen for instant navigation events from Material
        if (typeof document$ !== 'undefined') {
            document$.subscribe(applyAllTooltips);
        }

        // Also observe for dynamic content changes
        const observer = new MutationObserver(function (mutations) {
            let shouldUpdate = false;
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });
            if (shouldUpdate) {
                // Debounce to avoid excessive calls
                clearTimeout(window._tooltipUpdateTimeout);
                window._tooltipUpdateTimeout = setTimeout(applyAllTooltips, 100);
            }
        });

        // Observe the body for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
