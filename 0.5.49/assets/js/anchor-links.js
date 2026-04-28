/**
 * Anchor Links — Copy link to section on heading hover
 */
(function () {
  'use strict';

  function init() {
    var headings = document.querySelectorAll('.md-content__inner h2[id], .md-content__inner h3[id], .md-content__inner h4[id]');
    headings.forEach(function (h) {
      var link = document.createElement('a');
      link.className = 'mlad-anchor-link';
      link.href = '#' + h.id;
      link.setAttribute('aria-label', 'Copy link to this section');
      link.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

      link.addEventListener('click', function (e) {
        e.preventDefault();
        var url = window.location.origin + window.location.pathname + '#' + h.id;
        navigator.clipboard.writeText(url).catch(function () {});

        var original = link.innerHTML;
        link.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(function () {
          link.innerHTML = original;
        }, 1200);
      });

      h.appendChild(link);
    });
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
