/**
 * Suggested Prompts Module
 *
 * Provides page-specific prompt suggestions with in-memory caching.
 * Zero API cost approach using URL pattern matching.
 */

const SuggestedPrompts = {
    // In-memory cache: { pageUrl: { prompts: [...], timestamp: Date.now() } }
    cache: new Map(),

    // Route pattern -> prompts mapping
    routePrompts: {
        // Homepage
        '/': [
            "What projects has Brandon worked on?",
            "Tell me about Brandon's technical background"
        ],
        '/index.html': [
            "What projects has Brandon worked on?",
            "Tell me about Brandon's technical background"
        ],

        // Learning section
        '/learning/': [
            "What learning resources are available?",
            "How is this content organized?"
        ],
        '/learning/algorithms/': [
            "Explain this algorithm in simple terms",
            "What's the time/space complexity?"
        ],
        '/learning/algorithms/sliding_window/': [
            "When should I use sliding window?",
            "Walk me through this pattern"
        ],
        '/learning/algorithms/dynamic_programming/': [
            "How do I identify DP problems?",
            "Explain the recurrence relation"
        ],
        '/learning/algorithms/two_pointers/': [
            "When is two pointers useful?",
            "Compare to other approaches"
        ],
        '/learning/algorithms/backtracking/': [
            "How does backtracking work here?",
            "What are the pruning conditions?"
        ],

        // Data Structures
        '/learning/data_structures/': [
            "When would I use this structure?",
            "Compare to simpler alternatives"
        ],

        // Cloud AI
        '/learning/cloud_ai/': [
            "How do I get started?",
            "What prerequisites do I need?"
        ],
        '/learning/cloud_ai/vertex_ai/': [
            "Walk me through Vertex AI setup",
            "What models are available?"
        ],

        // Projects
        '/projects/': [
            "What are Brandon's main projects?",
            "Which project should I explore first?"
        ],
        '/projects/active/': [
            "Tell me about this project",
            "What technologies are used here?"
        ],
        '/projects/active/terminal-jarvis/': [
            "How do I install Terminal Jarvis?",
            "What can Terminal Jarvis do?"
        ],
        '/projects/experiments/': [
            "What was the goal of this experiment?",
            "What did Brandon learn?"
        ],

        // Docs-as-Code
        '/docs-as-code/': [
            "How does this documentation system work?",
            "What is the Zensical framework?"
        ],
        '/docs-as-code/ai/': [
            "How does the AI chat widget work?",
            "What's the backend architecture?"
        ],

        // Resume
        '/resume/': [
            "Summarize Brandon's experience",
            "What are his key technical skills?"
        ]
    },

    // Default fallback prompts
    defaultPrompts: [
        "What can you tell me about this page?",
        "How does this relate to Brandon's work?"
    ],

    /**
     * Get prompts for current page (with caching)
     * @param {string} pageUrl - URL path to match (defaults to current page)
     * @returns {string[]} Array of prompt strings
     */
    getPromptsForPage: function (pageUrl) {
        if (pageUrl === undefined) {
            pageUrl = window.location.pathname;
        }

        // Check cache first
        if (this.cache.has(pageUrl)) {
            return this.cache.get(pageUrl).prompts;
        }

        const prompts = this._matchRoute(pageUrl);

        // Cache for tab lifetime
        this.cache.set(pageUrl, {
            prompts: prompts,
            timestamp: Date.now()
        });

        return prompts;
    },

    /**
     * Match URL to best route pattern
     * @param {string} pathname - URL path to match
     * @returns {string[]} Matched prompts or default
     */
    _matchRoute: function (pathname) {
        // Strip base path if present (e.g., /my-life-as-a-dev/)
        var basePath = '/my-life-as-a-dev';
        var strippedPath = pathname;
        if (pathname.startsWith(basePath + '/')) {
            strippedPath = pathname.slice(basePath.length);
        } else if (pathname === basePath) {
            strippedPath = '/';
        }

        // Normalize path (remove trailing slash for comparison, except for root)
        var normalizedPath = strippedPath;
        if (strippedPath !== '/' && strippedPath.endsWith('/')) {
            normalizedPath = strippedPath.slice(0, -1);
        }

        // Exact match first (try both with and without trailing slash)
        if (this.routePrompts[strippedPath]) {
            return this.routePrompts[strippedPath];
        }
        if (this.routePrompts[normalizedPath]) {
            return this.routePrompts[normalizedPath];
        }
        if (this.routePrompts[normalizedPath + '/']) {
            return this.routePrompts[normalizedPath + '/'];
        }

        // Prefix matching (most specific wins)
        var routes = Object.keys(this.routePrompts);
        var matchingRoutes = [];

        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            if (strippedPath.startsWith(route) || normalizedPath.startsWith(route)) {
                matchingRoutes.push(route);
            }
        }

        // Sort by length descending (most specific first)
        matchingRoutes.sort(function (a, b) {
            return b.length - a.length;
        });

        if (matchingRoutes.length > 0) {
            return this.routePrompts[matchingRoutes[0]];
        }

        return this.defaultPrompts;
    },

    /**
     * Clear cache (for testing or SPA navigation)
     */
    clearCache: function () {
        this.cache.clear();
    }
};

window.SuggestedPrompts = SuggestedPrompts;
