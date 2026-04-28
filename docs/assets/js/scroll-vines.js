/**
 * Scroll Vines — Organic scroll-driven decoration
 * ------------------------------------------------
 * - Generates SVG vines that draw as the user scrolls
 * - Blooms sections into view via IntersectionObserver
 * - Subtle cursor glow in dark mode (desktop only)
 * - Respects prefers-reduced-motion
 */
(function () {
  'use strict';

  if (!document.body.classList.contains('landing-page')) return;

  const SUPPORTS_SCROLL_TIMELINE = CSS.supports &&
    CSS.supports('animation-timeline', 'scroll()');

  // =====================================================
  // 1. VINE SYSTEM
  // =====================================================

  const VINE_PATHS = [
    // Hero tendril — left side, curls upward then down
    'M 6,2 C 12,5 4,10 10,14 S 5,20 11,26',
    // Bridge from hero to content — right side arc
    'M 94,18 C 82,24 96,32 84,38 S 92,46 80,52',
    // Featured work section — left side crossing inward
    'M 8,48 C 18,54 6,62 16,68 S 7,76 14,84',
    // Principles — right side inward curl
    'M 92,78 C 80,84 94,92 82,98 S 88,106 78,112',
    // Closing CTA — center convergence
    'M 50,108 C 38,114 62,120 48,126 S 54,134 50,140',
    // Small accent near hero image
    'M 88,6 C 92,10 84,14 90,18 S 86,24 91,30'
  ];

  function createVineContainer() {
    const container = document.createElement('div');
    container.className = 'mlad-vine-container';
    container.setAttribute('aria-hidden', 'true');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.className = 'mlad-vine-svg';
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('viewBox', '0 0 100 150');

    VINE_PATHS.forEach((d) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
    });

    container.appendChild(svg);
    document.body.appendChild(container);
    return { container, svg };
  }

  function updateVineHeight(container) {
    const height = document.documentElement.scrollHeight;
    container.style.height = height + 'px';
  }

  /**
   * JS fallback for browsers without CSS scroll-timeline.
   * Computes path lengths and drives stroke-dashoffset from scroll.
   */
  function initScrollFallback(svg) {
    if (SUPPORTS_SCROLL_TIMELINE) return;

    const paths = Array.from(svg.querySelectorAll('path'));
    const meta = paths.map((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      return { path, length };
    });

    const ranges = [
      [0.02, 0.22],
      [0.18, 0.38],
      [0.34, 0.54],
      [0.50, 0.70],
      [0.66, 0.86],
      [0.80, 0.98]
    ];

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

        meta.forEach((m, i) => {
          const [start, end] = ranges[i] || [0, 1];
          const local = Math.min(1, Math.max(0, (progress - start) / (end - start)));
          m.path.style.strokeDashoffset = String(m.length * (1 - local));
        });

        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // =====================================================
  // 2. SECTION BLOOM
  // =====================================================

  function initBloom() {
    const selectors = [
      '.landing-page .tx-hero',
      '.landing-page .tx-container',
      '.landing-page section.md-typeset'
    ];
    const sections = document.querySelectorAll(selectors.join(', '));

    sections.forEach((el) => el.classList.add('mlad-bloom'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );

    sections.forEach((el) => observer.observe(el));

    // Principle cards border draw
    const principles = document.querySelectorAll('.landing-working-with-me > blockquote');
    const prinObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            prinObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    principles.forEach((el) => prinObserver.observe(el));
  }

  // =====================================================
  // 3. CURSOR GLOW (dark mode, desktop)
  // =====================================================

  function initCursorGlow() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'mlad-cursor-glow';
    document.body.appendChild(glow);

    let raf = null;
    let cx = 50;
    let cy = 50;

    document.addEventListener(
      'mousemove',
      (e) => {
        cx = (e.clientX / window.innerWidth) * 100;
        cy = (e.clientY / window.innerHeight) * 100;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          glow.style.setProperty('--cursor-x', cx + '%');
          glow.style.setProperty('--cursor-y', cy + '%');
          raf = null;
        });
      },
      { passive: true }
    );
  }

  // =====================================================
  // 4. HERO PARALLAX
  // =====================================================

  function initHeroParallax() {
    const heroImg = document.querySelector('.tx-hero__image img');
    if (!heroImg) return;

    let raf = null;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const offset = scrollTop * 0.15;
        heroImg.style.transform = 'translateY(' + offset + 'px)';
        raf = null;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // =====================================================
  // 5. STATS COUNTER
  // =====================================================

  function initStatsCounter() {
    const stats = document.querySelectorAll('.mlad-stats__number[data-count]');
    if (!stats.length) return;

    const duration = 1200;
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          if (!target || el.classList.contains('is-counted')) return;
          el.classList.add('is-counted');

          const start = performance.now();
          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);
            const eased = easeOutQuart(progress);
            const current = Math.round(eased * target);
            el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );

    stats.forEach((el) => observer.observe(el));
  }

  // =====================================================
  // INIT
  // =====================================================

  function init() {
    const { container, svg } = createVineContainer();
    updateVineHeight(container);
    initScrollFallback(svg);
    initBloom();
    initCursorGlow();
    initHeroParallax();
    initStatsCounter();

    let resizeDebounce;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => updateVineHeight(container), 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
