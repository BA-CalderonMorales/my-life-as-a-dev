/* Local experiments for the workbench. No accounts, API calls, or saved visitor data. */
(function () {
  "use strict";
  const studioMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let disposeStudio = () => {};

  function mountStudio() {
    const root = document.querySelector(".studio-home");
    if (!root || root.classList.contains("studio-ready")) return;
    disposeStudio();
    if (new URLSearchParams(location.search).get("flight") === "1")
      root.classList.add("studio-flight-preview");
    const events = new AbortController();
    const options = { signal: events.signal };
    const one = (selector) => root.querySelector(selector);
    const all = (selector) => [...root.querySelectorAll(selector)];
    let sortTimer = null;
    let sortPlaying = false;
    let sortIndex = 0,
      sortEnd = 7,
      sortCount = 0;
    let numbers = [7, 3, 8, 2, 6, 4, 1, 5];
    let agentStep = 0;
    let mark = null,
      markPoints = 0,
      starCount = 0;
    const seen = new Set();
    const choices = all("[data-project]");
    const exhibits = all(".studio-exhibit");
    const bars = one(".studio-sort-bars");
    const sortStatus = one(".studio-sort-status");
    const play = one("[data-sort-play]");
    const step = one("[data-sort-step]");
    const pad = one(".studio-sketchpad");
    const hint = pad.querySelector("text");
    const markStatus = one(".studio-mark-status");

    function pauseStudioSort() {
      clearInterval(sortTimer);
      sortTimer = null;
      sortPlaying = false;
      play.textContent = "Play it through";
    }
    function chooseStudioProject(id, userAction = false) {
      if (!choices.some((choice) => choice.dataset.project === id)) return;
      pauseStudioSort();
      choices.forEach((choice) => {
        if (choice.dataset.project === id)
          choice.setAttribute("aria-current", "true");
        else choice.removeAttribute("aria-current");
      });
      exhibits.forEach((exhibit) => {
        exhibit.hidden = exhibit.id !== `exhibit-${id}`;
      });
      if (userAction) seen.add(id);
      one(".studio-discoveries").textContent =
        seen.size === 4
          ? "You’ve had a look around all four. Thanks for spending a little time here."
          : seen.size
            ? `${seen.size} of 4 projects explored. There’s no right order.`
            : "Four projects. Follow whatever catches your eye.";
    }
    choices.forEach((choice) => {
      choice.setAttribute("aria-controls", `exhibit-${choice.dataset.project}`);
      choice.addEventListener(
        "click",
        (event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
            return;
          event.preventDefault();
          // The theme's page router also handles bubbling anchor clicks.
          event.stopPropagation();
          chooseStudioProject(choice.dataset.project, true);
          history.replaceState(history.state, "", choice.getAttribute("href"));
        },
        options,
      );
    });
    function studioHashChanged() {
      const id = location.hash.replace("#exhibit-", "");
      if (location.hash.startsWith("#exhibit-")) chooseStudioProject(id);
    }
    window.addEventListener("hashchange", studioHashChanged, options);
    root.addEventListener(
      "studio:select-project",
      (event) => {
        const id = event.detail?.id;
        if (!choices.some((choice) => choice.dataset.project === id)) return;
        chooseStudioProject(id, true);
        history.replaceState(history.state, "", `#exhibit-${id}`);
      },
      options,
    );
    const initial = location.hash.startsWith("#exhibit-")
      ? location.hash.slice(9)
      : "jarvis";
    chooseStudioProject(
      choices.some((choice) => choice.dataset.project === initial)
        ? initial
        : "jarvis",
    );

    const tools = {
      codex:
        "Codex selected.\nA place to start a coding session, then come back and try another tool.",
      claude:
        "Claude Code selected.\nDifferent tool, same starting point. Keep exploring what works for you.",
      gemini:
        "Gemini CLI selected.\nAnother tool in the shed. The real project runs from your terminal.",
    };
    all("[data-tool]").forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener(
        "click",
        () => {
          all("[data-tool]").forEach((item) =>
            item.setAttribute("aria-pressed", String(item === button)),
          );
          one(".studio-tool-output").textContent = tools[button.dataset.tool];
        },
        options,
      );
    });

    function renderStudioAgent() {
      const messages = [
        "You: “Help me understand this failing test.”",
        "Plan: Read the test and the code it checks. Explain what failed before suggesting a change.",
        "Your call: May the agent inspect those files? It waits here until you approve. You can ask for a different plan.",
        "Approved: The agent would inspect the files, report what it found, and propose a change for you to review.",
      ];
      one(".studio-agent-message").textContent = messages[agentStep];
      all("[data-agent-step]").forEach((item, index) => {
        if (index === agentStep) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      const next = one("[data-agent-next]");
      next.textContent = [
        "Make a plan",
        "Review the plan",
        "Approve this step",
        "Walk through again",
      ][agentStep];
      one("[data-agent-stop]").hidden = agentStep !== 2;
    }
    one("[data-agent-next]").addEventListener(
      "click",
      () => {
        agentStep = (agentStep + 1) % 4;
        renderStudioAgent();
      },
      options,
    );
    one("[data-agent-stop]").addEventListener(
      "click",
      () => {
        agentStep = 1;
        renderStudioAgent();
        one(".studio-agent-message").textContent =
          "Revised plan: Ask you for the failure message first. Read only the test you choose to share.";
      },
      options,
    );
    one("[data-agent-reset]").addEventListener(
      "click",
      () => {
        agentStep = 0;
        renderStudioAgent();
      },
      options,
    );

    function paintStudioSort(pair = []) {
      [...bars.children].forEach((bar, index) => {
        bar.style.setProperty("--bar", numbers[index]);
        bar.textContent = numbers[index];
        bar.toggleAttribute("data-comparing", pair.includes(index));
      });
      bars.setAttribute(
        "aria-label",
        `${sortEnd === 0 ? "Sorted" : "Current"} values: ${numbers.join(", ")}`,
      );
    }
    function advanceStudioSort() {
      if (sortEnd <= 0) return;
      const left = numbers[sortIndex],
        right = numbers[sortIndex + 1];
      const pair = [sortIndex, sortIndex + 1];
      sortCount++;
      if (left > right)
        [numbers[sortIndex], numbers[sortIndex + 1]] = [right, left];
      sortStatus.textContent = `Compare ${left} and ${right}. ${left > right ? "Swap them." : "They’re already in order."} Comparison ${sortCount}.`;
      sortIndex++;
      if (sortIndex >= sortEnd) {
        sortIndex = 0;
        sortEnd--;
      }
      paintStudioSort(pair);
      if (!sortEnd) {
        pauseStudioSort();
        paintStudioSort();
        sortStatus.textContent = `All sorted: ${numbers.join(", ")}. ${sortCount} comparisons. Each pass moved the largest remaining value to the right.`;
        step.disabled = play.disabled = true;
      }
    }
    step.addEventListener(
      "click",
      () => {
        pauseStudioSort();
        advanceStudioSort();
      },
      options,
    );
    play.addEventListener(
      "click",
      () => {
        if (sortPlaying) {
          pauseStudioSort();
          return;
        }
        sortPlaying = true;
        play.textContent = "Pause";
        advanceStudioSort();
        if (sortPlaying)
          sortTimer = setInterval(
            advanceStudioSort,
            studioMotion.matches ? 140 : 500,
          );
      },
      options,
    );
    one("[data-sort-shuffle]").addEventListener(
      "click",
      () => {
        pauseStudioSort();
        numbers = [1, 2, 3, 4, 5, 6, 7, 8];
        for (let index = numbers.length - 1; index > 0; index--) {
          const other = Math.floor(Math.random() * (index + 1));
          [numbers[index], numbers[other]] = [numbers[other], numbers[index]];
        }
        sortIndex = sortCount = 0;
        sortEnd = numbers.length - 1;
        step.disabled = play.disabled = false;
        paintStudioSort();
        sortStatus.textContent =
          "A fresh set. Compare two neighbors to get started.";
      },
      options,
    );
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) pauseStudioSort();
      },
      options,
    );
    studioMotion.addEventListener("change", pauseStudioSort, options);

    const inks = {
      pine: ["#3f6552", "#b4c9ac"],
      clay: ["#995637", "#ecb38a"],
      blue: ["#365e7d", "#adcadf"],
    };
    let currentInk = "pine";
    function paintStudioInk() {
      const colors = inks[currentInk];
      root.style.setProperty(
        "--studio-accent",
        document.body.dataset.mdColorScheme === "slate" ? colors[1] : colors[0],
      );
    }
    all("[data-ink]").forEach((button) =>
      button.addEventListener(
        "click",
        () => {
          currentInk = button.dataset.ink;
          paintStudioInk();
          all("[data-ink]").forEach((item) =>
            item.setAttribute("aria-pressed", String(item === button)),
          );
        },
        options,
      ),
    );
    const paletteObserver = new MutationObserver(paintStudioInk);
    paletteObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });
    function studioSketchPoint(event) {
      const matrix = pad.getScreenCTM();
      if (!matrix) return [0, 0];
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
        matrix.inverse(),
      );
      return [
        Math.max(0, Math.min(500, point.x)),
        Math.max(0, Math.min(160, point.y)),
      ];
    }
    function finishStudioMark() {
      mark = null;
    }
    pad.addEventListener(
      "pointerdown",
      (event) => {
        if (
          event.button !== 0 ||
          mark ||
          pad.querySelectorAll("path").length >= 64
        )
          return;
        hint.remove();
        pad.setPointerCapture(event.pointerId);
        markPoints = 0;
        const [x, y] = studioSketchPoint(event);
        mark = document.createElementNS("http://www.w3.org/2000/svg", "path");
        mark.setAttribute("d", `M${x.toFixed(1)} ${y.toFixed(1)}`);
        pad.appendChild(mark);
        markStatus.textContent =
          "A little of you, on the page. This sketch isn’t saved or shared.";
      },
      options,
    );
    pad.addEventListener(
      "pointermove",
      (event) => {
        if (!mark || markPoints++ >= 512) return;
        const [x, y] = studioSketchPoint(event);
        mark.setAttribute(
          "d",
          `${mark.getAttribute("d")} L${x.toFixed(1)} ${y.toFixed(1)}`,
        );
      },
      options,
    );
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
      pad.addEventListener(type, finishStudioMark, options),
    );
    one("[data-mark-star]").addEventListener(
      "click",
      () => {
        if (pad.querySelectorAll("path").length >= 64) return;
        hint.remove();
        const x = 40 + ((starCount * 71) % 420),
          y = 45 + (starCount++ % 3) * 35;
        const star = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        star.setAttribute(
          "d",
          Array.from({ length: 10 }, (_, index) => {
            const angle = (index * Math.PI) / 5 - Math.PI / 2,
              radius = index % 2 ? 6 : 15;
            return `${index ? "L" : "M"}${x + Math.cos(angle) * radius} ${y + Math.sin(angle) * radius}`;
          }).join(" ") + "Z",
        );
        pad.appendChild(star);
        markStatus.textContent =
          "Thanks for leaving a little light here. This sketch isn’t saved or shared.";
      },
      options,
    );
    one("[data-mark-clear]").addEventListener(
      "click",
      () => {
        finishStudioMark();
        pad.replaceChildren(hint);
        starCount = 0;
        markStatus.textContent =
          "A fresh page. Your sketch stays in this tab until you refresh.";
      },
      options,
    );
    root.classList.add("studio-ready");
    disposeStudio = () => {
      events.abort();
      paletteObserver.disconnect();
      pauseStudioSort();
    };
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mountStudio);
  else mountStudio();
  if (typeof document$ !== "undefined")
    document$.subscribe(() => {
      if (!document.querySelector(".studio-home")) disposeStudio();
      else mountStudio();
    });
})();
