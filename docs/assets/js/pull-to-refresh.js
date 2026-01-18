/**
 * Pull-to-Refresh Component
 * GitHub-inspired pull-to-refresh animation for mobile and tablet devices
 *
 * Features:
 * - Touch gesture detection with pull-down threshold
 * - Smooth animations with progress indicator
 * - Works on any page
 * - Respects reduced motion preferences
 * - PWA-compatible with safe area insets
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        threshold: 80,           // Pull distance to trigger refresh (px)
        maxPull: 120,            // Maximum pull distance (px)
        resistance: 2.5,         // Pull resistance factor
        refreshTimeout: 1500,    // Minimum refresh animation duration (ms)
        dampingFactor: 0.08      // Smooth animation damping
    };

    // State
    let isEnabled = false;
    let isPulling = false;
    let isRefreshing = false;
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;

    // DOM elements
    let container = null;
    let indicator = null;
    let progressRing = null;
    let arrowIcon = null;

    /**
     * Check if device supports touch
     */
    function isTouchDevice() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            window.matchMedia('(pointer: coarse)').matches
        );
    }

    /**
     * Check if user prefers reduced motion
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Check if page is scrolled to top
     */
    function isAtTop() {
        return window.scrollY <= 0;
    }

    /**
     * Create the pull-to-refresh DOM elements
     */
    function createElements() {
        // Create container
        container = document.createElement('div');
        container.className = 'ptr-container';
        container.setAttribute('aria-hidden', 'true');
        container.innerHTML = `
            <svg class="ptr-progress-ring" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20"></circle>
            </svg>
            <div class="ptr-indicator">
                <svg class="ptr-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
                <svg class="ptr-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
            </div>
        `;

        document.body.appendChild(container);

        // Cache element references
        indicator = container.querySelector('.ptr-indicator');
        progressRing = container.querySelector('.ptr-progress-ring circle');
        arrowIcon = container.querySelector('.ptr-arrow');
    }

    /**
     * Update the visual state based on pull distance
     */
    function updateVisuals() {
        if (!container) return;

        // Calculate progress (0 to 1)
        const progress = Math.min(pullDistance / CONFIG.threshold, 1);

        // Calculate transform offset
        const translateY = Math.min(pullDistance, CONFIG.maxPull);
        container.style.transform = `translateY(calc(-100% + ${translateY}px))`;

        // Update visibility
        if (pullDistance > 10) {
            container.classList.add('ptr-visible');
        } else {
            container.classList.remove('ptr-visible');
        }

        // Update threshold state
        if (pullDistance >= CONFIG.threshold) {
            container.classList.add('ptr-threshold');
        } else {
            container.classList.remove('ptr-threshold');
        }

        // Update progress ring
        if (progressRing) {
            const circumference = 2 * Math.PI * 20;
            const offset = circumference * (1 - progress);
            progressRing.style.strokeDashoffset = offset;
        }

        // Rotate arrow based on progress
        if (arrowIcon && !container.classList.contains('ptr-threshold')) {
            arrowIcon.style.transform = `rotate(${progress * 180}deg)`;
        }
    }

    /**
     * Reset the component to initial state
     */
    function reset() {
        isPulling = false;
        pullDistance = 0;

        if (container) {
            container.classList.add('ptr-transitioning');
            container.classList.remove('ptr-visible', 'ptr-threshold', 'ptr-refreshing');
            container.style.transform = 'translateY(-100%)';

            // Remove transition class after animation
            setTimeout(function() {
                container.classList.remove('ptr-transitioning');
            }, 300);
        }

        if (progressRing) {
            progressRing.style.strokeDashoffset = 126;
        }

        if (arrowIcon) {
            arrowIcon.style.transform = '';
        }
    }

    /**
     * Trigger page refresh
     */
    function triggerRefresh() {
        if (isRefreshing) return;

        isRefreshing = true;
        container.classList.add('ptr-refreshing');

        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = 'Refreshing page...';
        document.body.appendChild(announcement);

        // Perform refresh after minimum animation time
        setTimeout(function() {
            window.location.reload();
        }, CONFIG.refreshTimeout);
    }

    /**
     * Handle touch start
     */
    function onTouchStart(e) {
        if (isRefreshing || !isAtTop()) return;

        startY = e.touches[0].clientY;
        currentY = startY;
        isPulling = true;

        // Remove transition during active pulling
        if (container) {
            container.classList.remove('ptr-transitioning');
        }
    }

    /**
     * Handle touch move
     */
    function onTouchMove(e) {
        if (!isPulling || isRefreshing) return;

        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        // Only activate when pulling down at top of page
        if (deltaY > 0 && isAtTop()) {
            // Apply resistance to pull
            pullDistance = deltaY / CONFIG.resistance;

            // Prevent default scrolling when pulling
            if (pullDistance > 10) {
                e.preventDefault();
            }

            updateVisuals();
        } else {
            // Reset if scrolling up or not at top
            if (pullDistance > 0) {
                pullDistance = 0;
                updateVisuals();
            }
        }
    }

    /**
     * Handle touch end
     */
    function onTouchEnd() {
        if (!isPulling) return;

        if (pullDistance >= CONFIG.threshold && !isRefreshing) {
            // Trigger refresh
            triggerRefresh();
        } else {
            // Reset without refresh
            reset();
        }

        isPulling = false;
    }

    /**
     * Initialize the pull-to-refresh component
     */
    function init() {
        // Only enable on touch devices
        if (!isTouchDevice()) {
            return;
        }

        // Skip if already initialized
        if (isEnabled) {
            return;
        }

        // Create DOM elements
        createElements();

        // Add event listeners
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
        document.addEventListener('touchcancel', onTouchEnd, { passive: true });

        isEnabled = true;
    }

    /**
     * Destroy the pull-to-refresh component
     */
    function destroy() {
        if (!isEnabled) return;

        // Remove event listeners
        document.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        document.removeEventListener('touchcancel', onTouchEnd);

        // Remove DOM elements
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }

        // Reset state
        container = null;
        indicator = null;
        progressRing = null;
        arrowIcon = null;
        isEnabled = false;
        isRefreshing = false;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize on instant navigation (MkDocs Material)
    document.addEventListener('DOMContentLoaded', function() {
        // Handle instant navigation if used
        if (typeof document$ !== 'undefined') {
            document$.subscribe(function() {
                // Reset state on navigation
                if (isRefreshing) {
                    isRefreshing = false;
                }
                reset();
            });
        }
    });

    // Expose API for external control
    window.PullToRefresh = {
        init: init,
        destroy: destroy,
        reset: reset
    };

})();
