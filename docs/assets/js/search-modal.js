/**
 * Search Modal Enhancements
 *
 * Improves the MkDocs Material search modal experience on mobile/tablet:
 * - Custom close button for better visibility
 * - Click outside to close
 * - ESC key to close
 * - Prevents body scroll when modal is open
 * - Landscape mode optimizations
 */

(function () {
    'use strict';

    // DOM references
    let searchToggle = null;
    let searchContainer = null;
    let searchInput = null;
    let customCloseButton = null;
    let isInitialized = false;
    let savedScrollPosition = 0;

    /**
     * Check if device is mobile/tablet
     */
    function isMobileOrTablet() {
        return window.innerWidth <= 960 ||
            window.matchMedia('(pointer: coarse)').matches;
    }

    /**
     * Check if search modal is open
     */
    function isSearchOpen() {
        return searchToggle && searchToggle.checked;
    }

    /**
     * Close the search modal
     */
    function closeSearch() {
        if (searchToggle && searchToggle.checked) {
            searchToggle.checked = false;
            // Dispatch change event for MkDocs Material to update state
            searchToggle.dispatchEvent(new Event('change'));
            // Re-enable body scroll
            unlockScroll();
        }
    }

    /**
     * Lock body scroll (mobile)
     */
    function lockScroll() {
        if (!isMobileOrTablet()) return;
        savedScrollPosition = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + savedScrollPosition + 'px';
        document.body.style.width = '100%';
    }

    /**
     * Unlock body scroll (mobile)
     */
    function unlockScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (savedScrollPosition > 0) {
            window.scrollTo(0, savedScrollPosition);
            savedScrollPosition = 0;
        }
    }

    /**
     * Create custom close button
     */
    function createCloseButton() {
        // Check if already exists
        if (customCloseButton && document.contains(customCloseButton)) {
            return;
        }

        // Find the search inner container
        const searchInner = document.querySelector('.md-search__inner');
        if (!searchInner) return;

        // Create close button
        customCloseButton = document.createElement('button');
        customCloseButton.className = 'md-search__close-btn';
        customCloseButton.setAttribute('type', 'button');
        customCloseButton.setAttribute('aria-label', 'Close search');
        customCloseButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        // Add click handler
        customCloseButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            closeSearch();
        });

        // Insert at start of search inner
        searchInner.insertBefore(customCloseButton, searchInner.firstChild);
    }

    /**
     * Remove custom close button
     */
    function removeCloseButton() {
        if (customCloseButton && customCloseButton.parentNode) {
            customCloseButton.parentNode.removeChild(customCloseButton);
            customCloseButton = null;
        }
    }

    /**
     * Handle when search opens
     */
    function onSearchOpen() {
        // Create close button on mobile/tablet
        if (isMobileOrTablet()) {
            createCloseButton();
            lockScroll();
        }
        // Focus the input after a short delay
        setTimeout(function () {
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }

    /**
     * Handle when search closes
     */
    function onSearchClose() {
        unlockScroll();
    }

    /**
     * Handle click events on the search overlay
     */
    function handleOverlayClick(event) {
        if (!isSearchOpen()) return;
        if (!isMobileOrTablet()) return;

        // Get the search container (the actual modal box)
        const modal = document.querySelector('.md-search__inner');
        if (!modal) return;

        // Check if click is outside the modal content
        const rect = modal.getBoundingClientRect();
        const clickX = event.clientX;
        const clickY = event.clientY;

        // Only close if clicking outside the modal box
        if (
            clickX < rect.left ||
            clickX > rect.right ||
            clickY < rect.top ||
            clickY > rect.bottom
        ) {
            event.preventDefault();
            closeSearch();
        }
    }

    /**
     * Handle keyboard events
     */
    function handleKeyDown(event) {
        // ESC key closes search
        if (event.key === 'Escape' && isSearchOpen()) {
            event.preventDefault();
            closeSearch();
        }
    }

    /**
     * Enhance the existing back button for accessibility
     */
    function enhanceBackButton() {
        const backLabel = document.querySelector('.md-search__icon[for="__search"]');
        if (!backLabel) return;

        // Add accessibility attributes
        backLabel.setAttribute('aria-label', 'Close search');
        backLabel.setAttribute('role', 'button');

        // Handle keyboard activation
        if (!backLabel.hasAttribute('data-enhanced')) {
            backLabel.setAttribute('data-enhanced', 'true');
            backLabel.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    closeSearch();
                }
            });
        }
    }

    /**
     * Watch for search toggle state changes
     */
    function watchSearchToggle() {
        if (!searchToggle) return;

        // Listen for change events
        searchToggle.addEventListener('change', function () {
            if (this.checked) {
                onSearchOpen();
            } else {
                onSearchClose();
            }
        });

        // Also watch with MutationObserver for programmatic changes
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'checked' || mutation.type === 'attributes') {
                    if (searchToggle.checked) {
                        onSearchOpen();
                    } else {
                        onSearchClose();
                    }
                }
            });
        });

        observer.observe(searchToggle, {
            attributes: true
        });
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        if (isSearchOpen()) {
            if (isMobileOrTablet()) {
                createCloseButton();
            } else {
                removeCloseButton();
                unlockScroll();
            }
        }
    }

    /**
     * Initialize search modal enhancements
     */
    function init() {
        if (isInitialized) return;

        // Get DOM elements
        searchToggle = document.getElementById('__search');
        searchContainer = document.querySelector('.md-search');
        searchInput = document.querySelector('.md-search__input');

        if (!searchToggle || !searchContainer) {
            // Elements not ready, try again later
            setTimeout(init, 100);
            return;
        }

        isInitialized = true;

        // Enhance the back button
        enhanceBackButton();

        // Watch for search toggle changes
        watchSearchToggle();

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);

        // Click outside to close
        searchContainer.addEventListener('click', handleOverlayClick);

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 100);
        });

        // Handle orientation change
        window.addEventListener('orientationchange', function () {
            setTimeout(handleResize, 100);
        });

        // Check if search is already open (e.g., after navigation)
        if (isSearchOpen()) {
            onSearchOpen();
        }
    }

    /**
     * Re-initialize after navigation (for instant navigation)
     */
    function reinit() {
        // Clean up
        removeCloseButton();
        unlockScroll();

        // Reset state
        isInitialized = false;
        searchToggle = null;
        searchContainer = null;
        searchInput = null;

        // Re-initialize
        setTimeout(init, 50);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-init after instant navigation
    if (typeof document$ !== 'undefined') {
        document$.subscribe(reinit);
    }

    // Also handle MkDocs Material's location change
    document.addEventListener('DOMContentLoaded', function () {
        // Watch for navigation events
        var location$ = window.location$;
        if (location$) {
            location$.subscribe(reinit);
        }
    });
})();
