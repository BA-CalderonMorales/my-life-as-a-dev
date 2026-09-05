/*
 * Doodles that draw themselves on the notebook paper.
 *
 * Each doodle is one continuous marker stroke (the pen never lifts) that
 * draws itself the first time it scrolls into view, after a fixed
 * stagger so they show up sporadically rather than all at once.
 * Decorative only: hidden from assistive tech, disabled under
 * prefers-reduced-motion via CSS.
 */

(function () {
  "use strict";

  /*
   * Path data lives in small viewBoxes and is scaled by CSS. Every
   * doodle is one unbroken stroke unless a second path is listed, in
   * which case the marker "doubles back" for a detail.
   */
  const DOODLES = [
    {
      // Wobbly underline that loops into a spiral and flicks away.
      // Flattened to live inside the blank rule under the name.
      target: "h1",
      cls: "doodle-underline",
      delay: 600,
      paths: [
        "M8,14 C70,9 140,17 210,12 C260,8 300,15 350,11 " +
          "C378,9 398,6 410,12 C420,18 412,26 402,24 " +
          "C392,22 394,10 410,9 C432,8 468,15 498,12 " +
          "C514,10 534,6 548,2",
      ],
      viewBox: "0 0 560 34",
    },
    {
      // The yarn from the intro paragraph, trailing off the margin.
      target: "intro",
      cls: "doodle-yarn doodle-margin doodle-wide",
      delay: 2000,
      paths: [
        "M35,30 C40,26 46,30 44,36 C42,42 34,42 30,36 " +
          "C26,30 32,24 40,26 C48,28 52,38 44,44 " +
          "C36,50 24,46 22,36 C20,26 30,20 40,22 " +
          "C46,24 48,30 44,34 " +
          "C38,42 34,52 38,62 C42,74 34,84 24,90 " +
          "C18,93 14,92 12,88",
      ],
      viewBox: "0 0 70 100",
    },
    {
      // Arrow curving down toward the day job label, head doubled back.
      target: "the day job",
      cls: "doodle-dayjob",
      delay: 1500,
      paths: [
        "M130,10 C105,22 70,34 38,50 C30,54 22,58 14,64 " +
          "C22,54 28,48 36,46 C30,54 26,62 24,68",
      ],
      viewBox: "0 0 140 80",
    },
    {
      // Kid sun: one pen drill, out and back, around the center.
      target: "lately",
      cls: "doodle-sun doodle-twinkle",
      delay: 2600,
      paths: [
        "M40,24 C36,16 38,9 41,3 C44,9 45,16 43,23 " +
          "C50,18 56,14 62,13 C57,18 52,23 47,26 " +
          "C54,26 60,29 64,33 C58,33 51,32 46,31 " +
          "C50,37 53,43 53,49 C49,44 45,38 42,33 " +
          "C42,40 40,47 37,52 C36,46 36,39 37,33 " +
          "C32,38 27,42 21,44 C26,39 31,35 36,32 " +
          "C29,31 23,29 18,25 C24,25 31,27 37,29 " +
          "C34,23 33,17 34,11 C36,17 38,22 40,26",
      ],
      viewBox: "0 0 70 58",
    },
    {
      // A heart after the family line, the way a kid signs their work.
      target: "li:family time",
      cls: "doodle-inline doodle-heart",
      delay: 2600,
      paths: [
        "M10,16 C4,10 1,6 3,3 C5,0 9,1 10,4 C11,1 15,0 17,3 " +
          "C19,6 16,10 10,16",
      ],
      viewBox: "0 0 20 18",
    },
    {
      // Coffee after the undergrad-at-night line.
      target: "li:kaggle",
      cls: "doodle-inline doodle-cup",
      delay: 3400,
      paths: [
        "M2,6 L16,6 L14,16 C13,18 5,18 4,16 Z",
        "M16,7 C19,7 20,11 16,12",
      ],
      viewBox: "0 0 22 20",
    },
    {
      // Paper plane over a dotted trail across the travel section.
      target: "been around",
      paragraph: true,
      cls: "doodle-plane",
      delay: 900,
      paths: [
        "M6,22 C90,10 180,26 270,16 C350,8 430,24 510,16 " +
          "C560,10 600,12 630,14",
        "M628,16 L688,4 L664,30 L656,18 Z",
      ],
      dots: 0,
      viewBox: "0 0 700 34",
    },
    {
      // Lightbulb over the building section, filament doubles back.
      target: "building",
      cls: "doodle-bulb",
      delay: 2000,
      paths: [
        "M34,62 C24,50 22,36 30,24 C38,12 56,12 62,26 " +
          "C67,37 62,48 52,60 C50,63 50,66 50,70 " +
          "C50,78 36,78 36,70 C36,66 38,64 36,62",
        "M40,30 C44,26 48,30 44,34",
      ],
      viewBox: "0 0 80 88",
    },
    {
      // Arrow pointing at the connect links with a heart at the tip.
      target: "connect",
      cls: "doodle-connect",
      delay: 1200,
      paths: [
        "M10,8 C30,30 50,48 74,62 C70,60 66,62 62,66 " +
          "C68,64 74,64 78,62",
        "M84,74 c-4,-6 -12,-2 -8,4 c3,5 8,7 8,7 c0,0 5,-2 8,-7 " +
          "c4,-6 -4,-10 -8,-4 z",
      ],
      viewBox: "0 0 110 92",
    },
    {
      // Margin spiral beside the day job (wide sheets only).
      target: "the day job",
      cls: "doodle-margin doodle-spiral",
      delay: 3200,
      paths: [
        "M30,30 C34,26 40,30 38,36 C36,42 28,42 24,36 " +
          "C20,30 26,22 34,24 C42,26 46,36 40,44",
      ],
      viewBox: "0 0 60 60",
    },
    {
      // Margin star beside lately (wide sheets only).
      target: "lately",
      cls: "doodle-margin doodle-star",
      delay: 2900,
      paths: [
        "M30,10 C32,20 34,24 42,22 C36,28 34,32 40,38 " +
          "C32,36 28,36 22,42 C24,34 22,30 14,30 " +
          "C22,26 24,22 22,14 C26,20 28,20 30,10",
      ],
      viewBox: "0 0 56 52",
    },
  ];

  function buildSvg(doodle) {
    const svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svg.setAttribute("class", "doodle " + doodle.cls);
    svg.setAttribute("viewBox", doodle.viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    doodle.paths.forEach(function (d, index) {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", d);
      path.setAttribute("pathLength", "1");
      path.setAttribute("class", index === 0 && doodle.dots !== undefined
        ? "dot"
        : "draws"
      );
      if (index > 0) {
        path.style.animationDelay = index * 1.4 + "s";
      }
      svg.appendChild(path);
    });
    return svg;
  }

  function findTarget(name) {
    const article = document.querySelector("article.md-typeset");
    if (!article) return null;
    if (name === "h1") return article.querySelector("h1");
    if (name === "intro") {
      // The paragraph after the location line, where the yarn starts.
      const location = article.querySelector("h1 + p");
      return location ? location.nextElementSibling : null;
    }
    if (name.startsWith("li:")) {
      const wanted = name.slice(3).trim().toLowerCase();
      for (const item of article.querySelectorAll("li")) {
        if (item.textContent.trim().toLowerCase().includes(wanted)) {
          return item;
        }
      }
      return null;
    }
    const wanted = name.trim().toLowerCase();
    const headings = article.querySelectorAll("h2");
    for (const heading of headings) {
      if (heading.textContent.trim().toLowerCase() === wanted) {
        return heading;
      }
    }
    return null;
  }

  function anchor(doodle, target, svg) {
    if (doodle.cls.includes("doodle-inline")) {
      // Inline doodles flow with the text, right after the words.
      svg.classList.add("doodle-inline");
      target.appendChild(svg);
      return;
    }
    target.classList.add("doodle-host");
    if (doodle.paragraph) {
      // Anchor trail doodles to the paragraph that follows the label.
      const body = target.nextElementSibling;
      if (body && body.tagName === "P") {
        body.classList.add("doodle-host");
        body.appendChild(svg);
        svg.classList.add("doodle-below");
        return;
      }
    }
    svg.classList.add("doodle-pinned");
    target.appendChild(svg);
  }

  function schedule(doodle, svg) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          window.setTimeout(function () {
            svg.classList.add("drawn");
          }, doodle.delay);
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(svg);
  }

  function init() {
    DOODLES.forEach(function (doodle) {
      const target = findTarget(doodle.target);
      if (!target) return;
      const svg = buildSvg(doodle);
      anchor(doodle, target, svg);
      schedule(doodle, svg);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
