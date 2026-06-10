/**
 * Reading Time — Estimate based on word count
 * Inserts a small indicator after the first H1 on content pages.
 */
(function () {
  'use strict';

  function init() {
    var content = document.querySelector('.md-content__inner');
    var h1 = document.querySelector('.md-content__inner > h1:first-child');
    if (!content || !h1) return;

    // Skip landing, canvas, and 404 pages
    if (document.body.classList.contains('landing-page')) return;
    if (document.body.classList.contains('canvas-page')) return;

    var text = content.innerText || content.textContent || '';
    var words = text.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.round(words / 200));

    var indicator = document.createElement('span');
    indicator.className = 'mlad-reading-time';
    indicator.textContent = minutes + ' min read';

    h1.parentNode.insertBefore(indicator, h1.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(init);
  }
})();
