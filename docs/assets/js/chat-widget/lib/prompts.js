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
        '/learning/algorithms/arrays/': [
            "How do array algorithms work?",
            "What's the time/space complexity?"
        ],
        '/learning/algorithms/hash_tables/': [
            "When should I use a hash table?",
            "How does collision resolution work?"
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
        '/learning/algorithms/fast_slow_pointers/': [
            "When do I use fast and slow pointers?",
            "How does cycle detection work?"
        ],
        '/learning/algorithms/backtracking/': [
            "How does backtracking work here?",
            "What are the pruning conditions?"
        ],
        '/learning/algorithms/binary_search_on_answer/': [
            "When should I binary search on the answer?",
            "How do I define the search space?"
        ],
        '/learning/algorithms/greedy/': [
            "How do I know if greedy applies here?",
            "What is the greedy choice property?"
        ],
        '/learning/algorithms/heap_priority_queue/': [
            "When should I use a heap?",
            "How does a priority queue work?"
        ],
        '/learning/algorithms/monotonic_stack/': [
            "What problems use a monotonic stack?",
            "Walk me through this pattern"
        ],
        '/learning/algorithms/graph_traversal/': [
            "When do I use BFS vs DFS?",
            "How do I detect cycles in a graph?"
        ],
        '/learning/algorithms/trie/': [
            "When should I use a trie?",
            "How is a trie different from a hash map?"
        ],
        '/learning/algorithms/space_complexity/': [
            "How do I analyze space complexity?",
            "What are common space trade-offs?"
        ],

        // Interview Preparation
        '/learning/interview_preparation/': [
            "How should I approach interview problems?",
            "What topics should I focus on?"
        ],

        // Additional Topics
        '/learning/additional_topics/': [
            "What advanced topics are covered here?",
            "How do these relate to system design?"
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

        // Strip version prefix if present (e.g., /latest/ or /0.5.3/)
        strippedPath = strippedPath.replace(/^\/(latest|[0-9]+\.[0-9]+\.[0-9]+)\//, '/');

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
