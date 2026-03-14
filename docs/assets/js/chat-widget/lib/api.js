/** Chat Widget API -- handles communication with the backend AI service. */

const ChatAPI = {
    sessionId: null,
    lastRequestTime: 0,

    /** Build a stable URL for backend processing (no query/hash fragments). */
    _getCanonicalPageUrl: function () {
        return window.location.origin + window.location.pathname;
    },

    /**
     * Extract visible main content text and normalize it for backend context.
     * Avoids noisy sidebar/nav/widget text that can degrade responses.
     */
    _getPageContext: function (maxLength) {
        var root = document.querySelector('article.md-content__inner') ||
            document.querySelector('.md-content__inner') ||
            document.querySelector('[data-md-component="content"]') ||
            document.querySelector('main') ||
            document.body;

        var clone = root.cloneNode(true);
        var excluded = clone.querySelectorAll(
            'script, style, noscript, .share-actions, #ai-chat-trigger, #ai-chat-modal, .ai-chat-toast'
        );
        excluded.forEach(function (el) { el.remove(); });

        var text = (clone.textContent || '')
            .replace(/[\u0000-\u001F\u007F]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!text) {
            text = (document.body.innerText || '').replace(/\s+/g, ' ').trim();
        }

        return text.substring(0, maxLength);
    },

    /** Fetch with an AbortController timeout. */
    _fetchWithTimeout: function (url, options, timeoutMs) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
        return fetch(url, Object.assign({}, options, { signal: controller.signal }))
            .finally(function () { clearTimeout(timer); });
    },

    /** Build a de-duplicated list of candidate backend URLs. */
    _getEndpointCandidates: function (primaryUrl, urlList) {
        var candidates = [];

        function add(url) {
            if (url && candidates.indexOf(url) === -1) {
                candidates.push(url);
            }
        }

        add(primaryUrl);
        if (Array.isArray(urlList)) {
            urlList.forEach(add);
        }

        return candidates;
    },

    /** Try a list of endpoints until one succeeds or all fail. */
    _tryEndpointCandidates: async function (label, urls, fetchOpts, timeoutMs, logger) {
        var lastError = null;

        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];

            try {
                logger.log('Trying ' + label + ' endpoint:', url);
                var response = timeoutMs
                    ? await this._fetchWithTimeout(url, fetchOpts, timeoutMs)
                    : await fetch(url, fetchOpts);

                if (response.ok) {
                    return { response: response, url: url, lastError: null };
                }

                logger.log(label + ' returned ' + response.status + ' from ' + url);
                lastError = new Error('HTTP ' + response.status);
            } catch (e) {
                logger.log(label + ' unavailable (' + e.message + ') at ' + url);
                lastError = e;
            }
        }

        return { response: null, url: null, lastError: lastError };
    },

    sendMessage: async function (message) {
        var config = window.ChatConfig;
        var logger = window.ChatLogger;
        var transformer = window.ResponseTransformer;
        var parser = window.MessageParser ? new window.MessageParser() : null;

        var now = Date.now();
        if (now - this.lastRequestTime < config.MIN_REQUEST_INTERVAL) {
            throw new Error('RATE_LIMITED');
        }
        this.lastRequestTime = now;

        var payload = JSON.stringify({
            question: message,
            context: this._getPageContext(config.MAX_CONTEXT_LENGTH),
            page_url: this._getCanonicalPageUrl(),
            session_id: this.sessionId
        });

        var fetchOpts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        };

        var response = null;
        var lastError = null;

        // Try NVIDIA candidates first, then fall back to Go/Gemini candidates.
        var nvidiaCandidates = this._getEndpointCandidates(config.NVIDIA_API_URL, config.NVIDIA_API_URLS);
        if (nvidiaCandidates.length > 0) {
            var nvidiaResult = await this._tryEndpointCandidates(
                'NVIDIA',
                nvidiaCandidates,
                fetchOpts,
                config.NVIDIA_TIMEOUT,
                logger
            );
            response = nvidiaResult.response;
            lastError = nvidiaResult.lastError;
        }

        if (!response) {
            var apiCandidates = this._getEndpointCandidates(config.API_URL, config.API_URLS);
            var apiResult = await this._tryEndpointCandidates(
                'Go service',
                apiCandidates,
                fetchOpts,
                0,
                logger
            );
            response = apiResult.response;
            lastError = apiResult.lastError || lastError;
        }

        if (!response) {
            if (lastError) {
                throw lastError;
            }
            throw new TypeError('Failed to fetch');
        }

        logger.log('Response status:', response.status);

        if (!response.ok) {
            var errorText = await response.text();
            logger.error('Error response:', errorText);
            throw new Error('HTTP ' + response.status + ': ' + errorText);
        }

        var data = await response.json();
        logger.log('Raw response data:', data);

        var structuredResponse = null;
        if (transformer) {
            structuredResponse = transformer.transform(data);
            if (!structuredResponse.success) {
                logger.error('Response transformation failed:', structuredResponse.error);
                throw new Error('Invalid response format: ' + structuredResponse.error);
            }
            logger.log('Structured response:', transformer.getSummary(structuredResponse));
        }

        var validatedData = this.validateResponse(data, parser);
        this.sessionId = validatedData.session_id;

        return Object.assign({}, validatedData, {
            structured: structuredResponse ? structuredResponse.data : null
        });
    },

    /** Validate the API response, using the parser if available. */
    validateResponse: function (data, parser) {
        if (parser && parser.validateResponse) {
            var validation = parser.validateResponse(data);
            if (!validation.valid) {
                window.ChatLogger.error('Response validation failed:', validation.errors);
                throw new Error('Invalid response format: ' + validation.errors.join(', '));
            }
            return validation.data;
        }

        if (!data || typeof data.answer !== 'string') {
            throw new Error('Invalid response format');
        }

        return {
            answer: this.normalizeText(data.answer),
            session_id: data.session_id || null,
            sources: data.sources || []
        };
    },

    /** Normalize line endings and collapse excessive blank lines. */
    normalizeText: function (text) {
        if (!text) return '';
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    },

    /** Map an error to a user-friendly message. */
    getErrorMessage: function (error) {
        if (error.message === 'RATE_LIMITED') {
            return 'Please wait a moment before sending another message.';
        }
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            return 'Network error. Please check your connection and try again.';
        }
        if (error.message.includes('CORS')) {
            return 'Connection blocked. Please try again from the production site.';
        }
        if (error.message.includes('Invalid response format')) {
            return 'Received an unexpected response. Please try again.';
        }
        return 'Sorry, I encountered an error. Please try again.';
    },

    getSessionId: function () {
        return this.sessionId;
    },

    resetSession: function () {
        this.sessionId = null;
        window.ChatLogger.log('Session reset');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatAPI;
} else {
    window.ChatAPI = ChatAPI;
}
