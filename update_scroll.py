import re

with open('/mnt/c/Users/bacm6/world/repositories/working/my-life-as-a-dev/site/assets/js/living-index.js', 'r') as f:
    content = f.read()

old = '''        function updateScrollState() {
            frameRequested = false;
            if (layoutTransitioning) return;

            if (!desktopLayout.matches) {
                root.classList.add("is-open");
                root.classList.remove("is-indexed");
                var mobileRoots = reducedMotion.matches
                    ? 1
                    : easeInOutCubic(clamp(
                        (window.scrollY - mobileRootStart) / mobileRootRange,
                        0,
                        1
                    ));
                root.style.setProperty(
                    "--life-roots",
                    (Number.isFinite(mobileRoots) ? mobileRoots : 0).toFixed(3)
                );
                return;
            }

            if (reducedMotion.matches) {
                applyProgress(1);
                selectFacet(committedFacet);
                return;
            }

            applyProgress((window.scrollY - journeyStart) / journeyRange);
        }'''

new = '''        function updateScrollState() {
            frameRequested = false;
            if (layoutTransitioning) return;

            // Track scroll direction for root pulse animation
            var currentScrollY = window.scrollY;
            var delta = currentScrollY - lastScrollY;
            if (Math.abs(delta) > 0.5) {
                scrollDirection = delta > 0 ? 1 : -1;
                lastScrollY = currentScrollY;
                var rootsEl = root.querySelector(".life-tree__roots");
                if (rootsEl) {
                    if (scrollDirection > 0) {
                        rootsEl.classList.add("scroll-down");
                    } else {
                        rootsEl.classList.remove("scroll-down");
                    }
                    if (scrollDirectionFrame !== null) {
                        window.cancelAnimationFrame(scrollDirectionFrame);
                    }
                    scrollDirectionFrame = window.requestAnimationFrame(function () {
                        scrollDirectionFrame = null;
                        setTimeout(function () {
                            if (rootsEl && window.scrollY === lastScrollY) {
                                rootsEl.classList.remove("scroll-down");
                            }
                        }, 1200);
                    });
                }
            }

            if (!desktopLayout.matches) {
                root.classList.add("is-open");
                root.classList.remove("is-indexed");
                var mobileRoots = reducedMotion.matches
                    ? 1
                    : easeInOutCubic(clamp(
                        (window.scrollY - mobileRootStart) / mobileRootRange,
                        0,
                        1
                    ));
                root.style.setProperty(
                    "--life-roots",
                    (Number.isFinite(mobileRoots) ? mobileRoots : 0).toFixed(3)
                );
                return;
            }

            if (reducedMotion.matches) {
                applyProgress(1);
                selectFacet(committedFacet);
                return;
            }

            applyProgress((window.scrollY - journeyStart) / journeyRange);
        }'''

content = content.replace(old, new)

with open('/mnt/c/Users/bacm6/world/repositories/working/my-life-as-a-dev/site/assets/js/living-index.js', 'w') as f:
    f.write(content)

print('Done')