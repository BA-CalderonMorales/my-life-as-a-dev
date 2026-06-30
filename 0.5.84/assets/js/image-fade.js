/**
 * Image Fade — Lazy-loaded images fade in on load
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function markLoaded(img) {
    img.classList.add('is-loaded');
  }

  function init() {
    var images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(function (img) {
      if (img.complete) {
        markLoaded(img);
      } else {
        img.addEventListener('load', function () { markLoaded(img); });
        img.addEventListener('error', function () { markLoaded(img); });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
