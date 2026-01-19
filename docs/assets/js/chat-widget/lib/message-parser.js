/**
 * MessageParser - Handles parsing and formatting of chat messages
 *
 * This class converts raw text responses into formatted HTML, handling:
 * - Markdown headers (# through ######)
 * - Markdown links [text](url)
 * - Markdown-style formatting (bold, italic)
 * - Bullet points and nested lists
 * - URLs and email links
 * - Proper escaping for XSS prevention
 *
 * Parsing Strategy (Placeholder-Based):
 * The parser uses placeholders to protect markdown links from corruption
 * during intermediate transformations. This prevents issues where header
 * normalization or line splitting could break anchor tags.
 *
 * Order of operations:
 * 1. Extract markdown links → store with placeholders
 * 2. Normalize headers (ensure proper line breaks)
 * 3. Escape HTML
 * 4. Parse headers
 * 5. Parse lists and paragraphs
 * 6. Parse inline formatting (bold, italic)
 * 7. Parse raw URLs and emails
 * 8. Restore markdown links from placeholders
 *
 * Expected input format from API (Pydantic model):
 * {
 *   "answer": "string with markdown formatting",
 *   "session_id": "uuid string",
 *   "sources": ["optional array of source URLs"]
 * }
 */
class MessageParser {
    constructor() {
        // Patterns for markdown parsing
        this.patterns = {
            // Markdown link: [text](url)
            markdownLink: /\[([^\]]+)\]\(([^)]+)\)/g,
            // Header: # through ###### at start of line
            header: /^(#{1,6})\s+(.+)$/,
            // Bold: **text** or __text__
            bold: /\*\*([^*]+)\*\*|__([^_]+)__/g,
            // Italic: *text* or _text_ (but not inside bold)
            italic: /(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)/g,
            // URL pattern (but not already in href or markdown link)
            url: /(https?:\/\/[^\s<>"'\)\]]+)/g,
            // Email pattern
            email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
            // Bullet point line: starts with * or - followed by space
            bulletLine: /^[\s]*[\*\-]\s+(.+)$/,
            // Numbered list: starts with number followed by . or )
            numberedLine: /^[\s]*(\d+)[\.\)]\s+(.+)$/
        };

        // Punctuation that shouldn't be part of URLs
        this.trailingPunctuation = ['.', ',', '!', '?', ')', ']', ';', ':', "'", '"'];

        // Placeholder storage for protected content
        this.placeholders = new Map();
        this.placeholderCounter = 0;
    }

    /**
     * Main parsing method - converts raw text to formatted HTML
     * @param {string} text - Raw text from API response
     * @returns {string} - Formatted HTML string
     */
    parse(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        // Reset placeholder storage for each parse
        this.placeholders = new Map();
        this.placeholderCounter = 0;

        // Step 1: Extract and protect markdown links with placeholders
        // This prevents link corruption during subsequent transformations
        let result = this.extractMarkdownLinks(text);

        // Step 2: Normalize headers (ensure proper line breaks before #)
        result = this.normalizeHeaders(result);

        // Step 3: Escape HTML to prevent XSS
        result = this.escapeHtml(result);

        // Step 4: Parse structured content (headers, lists, paragraphs)
        result = this.parseStructuredContent(result);

        // Step 5: Parse inline formatting (bold, italic)
        result = this.parseInlineFormatting(result);

        // Step 6: Parse raw links (URLs and emails not in markdown format)
        result = this.parseLinks(result);

        // Step 7: Restore markdown links from placeholders
        result = this.restorePlaceholders(result);

        return result;
    }

    /**
     * Extract markdown links and replace with placeholders
     * Protects [text](url) from being corrupted by other transformations
     * @param {string} text - Raw text
     * @returns {string} - Text with placeholders instead of markdown links
     */
    extractMarkdownLinks(text) {
        return text.replace(this.patterns.markdownLink, (match, linkText, url) => {
            const placeholder = `__MDLINK_${this.placeholderCounter++}__`;
            // Store the link info for later restoration
            this.placeholders.set(placeholder, { text: linkText, url: url });
            return placeholder;
        });
    }

    /**
     * Restore placeholders with actual HTML links
     * @param {string} text - Text with placeholders
     * @returns {string} - Text with HTML anchor tags
     */
    restorePlaceholders(text) {
        let result = text;
        for (const [placeholder, linkInfo] of this.placeholders) {
            const { text: linkText, url } = linkInfo;
            // Ensure URL has protocol
            const safeUrl = this.ensureProtocol(url);
            const anchor = `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${this.escapeHtml(linkText)}</a>`;
            result = result.replace(placeholder, anchor);
        }
        return result;
    }

    /**
     * Ensure URL has a protocol (default to https)
     * @param {string} url - URL that may or may not have protocol
     * @returns {string} - URL with protocol
     */
    ensureProtocol(url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        if (url.startsWith('mailto:')) {
            return url;
        }
        // Default to https for protocol-less URLs
        return 'https://' + url;
    }

    /**
     * Normalize headers to ensure proper line breaks
     * Handles inline headers like "Some text # Header" → "Some text\n# Header"
     * @param {string} text - Text to normalize
     * @returns {string} - Text with proper line breaks before headers
     */
    normalizeHeaders(text) {
        let result = text;

        // Ensure headers at start of text or after newlines are preserved
        // Handle inline headers: "text # header" → "text\n# header"
        // But don't match # inside words or URLs
        result = result.replace(/([^\n#])(\s*)(#{1,6})\s+/g, (match, before, space, hashes) => {
            // If there's content before the hash, add a newline
            if (before.trim()) {
                return before + '\n' + hashes + ' ';
            }
            return match;
        });

        return result;
    }

    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} text - Raw text
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Parse structured content like headers, bullet points and numbered lists
     * @param {string} text - Text to parse
     * @returns {string} - Text with HTML headers, lists, and paragraphs
     */
    parseStructuredContent(text) {
        // Normalize line breaks - handle both \n and inline bullet patterns
        // Look for patterns like "text: * item1 * item2" or "text:\n* item1\n* item2"
        const normalized = this.normalizeBulletPoints(text);

        // Split into lines
        const lines = normalized.split('\n');
        const result = [];
        let currentList = null;
        let listType = null;

        for (const line of lines) {
            const trimmed = line.trim();

            // Check for header (# through ######)
            const headerMatch = trimmed.match(this.patterns.header);
            if (headerMatch) {
                // Close any open list first
                if (currentList !== null && currentList.length > 0) {
                    result.push(this.buildList(currentList, listType));
                    currentList = null;
                    listType = null;
                }
                const level = headerMatch[1].length; // Number of # symbols
                const headerText = headerMatch[2].trim();
                result.push(`<h${level} class="ai-chat-header ai-chat-h${level}">${headerText}</h${level}>`);
                continue;
            }

            // Check for bullet point
            const bulletMatch = trimmed.match(this.patterns.bulletLine);
            if (bulletMatch) {
                if (currentList === null) {
                    currentList = [];
                    listType = 'ul';
                }
                currentList.push(bulletMatch[1].trim());
                continue;
            }

            // Check for numbered list
            const numberedMatch = trimmed.match(this.patterns.numberedLine);
            if (numberedMatch) {
                if (currentList === null) {
                    currentList = [];
                    listType = 'ol';
                }
                currentList.push(numberedMatch[2].trim());
                continue;
            }

            // Not a list item - close any open list
            if (currentList !== null && currentList.length > 0) {
                result.push(this.buildList(currentList, listType));
                currentList = null;
                listType = null;
            }

            // Add non-empty lines as paragraphs
            if (trimmed) {
                result.push(`<p>${trimmed}</p>`);
            }
        }

        // Close any remaining list
        if (currentList !== null && currentList.length > 0) {
            result.push(this.buildList(currentList, listType));
        }

        return result.join('');
    }

    /**
     * Normalize bullet points that might be inline
     * Converts "text: * item1 * item2" to "text:\n* item1\n* item2"
     * @param {string} text - Text to normalize
     * @returns {string} - Normalized text with proper line breaks
     */
    normalizeBulletPoints(text) {
        // First, handle explicit newlines
        let result = text;

        // Pattern for inline bullets: look for " * " or " - " that indicate list items
        // But be careful not to match asterisks used for bold formatting
        // We look for patterns like ": * " or after a period/colon followed by bullet
        result = result.replace(/([.:!?])\s*\*\s+/g, '$1\n* ');
        result = result.replace(/([.:!?])\s*-\s+/g, '$1\n- ');

        // Also handle when bullets follow each other inline
        result = result.replace(/\s+\*\s+(?=[A-Z]|[a-z])/g, '\n* ');
        result = result.replace(/\s+-\s+(?=[A-Z]|[a-z])/g, '\n- ');

        return result;
    }

    /**
     * Build an HTML list from array of items
     * @param {string[]} items - List items
     * @param {string} type - 'ul' or 'ol'
     * @returns {string} - HTML list
     */
    buildList(items, type = 'ul') {
        const listItems = items.map(item => `<li>${item}</li>`).join('');
        return `<${type} class="ai-chat-list">${listItems}</${type}>`;
    }

    /**
     * Parse inline markdown formatting (bold, italic)
     * @param {string} text - Text to parse
     * @returns {string} - Text with HTML formatting
     */
    parseInlineFormatting(text) {
        let result = text;

        // Bold: **text** or __text__
        result = result.replace(this.patterns.bold, (match, p1, p2) => {
            const content = p1 || p2;
            return `<strong>${content}</strong>`;
        });

        // Italic: *text* or _text_ (single asterisk/underscore)
        // Be careful not to match list bullets
        result = result.replace(/(?<![*\w])\*([^*\n]+)\*(?![*\w])/g, '<em>$1</em>');
        result = result.replace(/(?<![_\w])_([^_\n]+)_(?![_\w])/g, '<em>$1</em>');

        return result;
    }

    /**
     * Parse URLs and emails into clickable links
     * @param {string} text - Text to parse
     * @returns {string} - Text with HTML links
     */
    parseLinks(text) {
        let result = text;

        // Replace URLs with clickable links
        result = result.replace(this.patterns.url, (url) => {
            return this.createLink(url);
        });

        // Replace email addresses with mailto links
        result = result.replace(this.patterns.email, (email) => {
            // Don't double-link if already inside an anchor tag
            return `<a href="mailto:${email}" class="ai-chat-link ai-chat-email-link">${email}</a>`;
        });

        return result;
    }

    /**
     * Create an HTML link from a URL
     * @param {string} url - URL to linkify
     * @returns {string} - HTML anchor tag
     */
    createLink(url) {
        // Clean up trailing punctuation
        let cleanUrl = url;
        let trailing = '';

        while (this.trailingPunctuation.includes(cleanUrl.slice(-1))) {
            trailing = cleanUrl.slice(-1) + trailing;
            cleanUrl = cleanUrl.slice(0, -1);
        }

        // Generate display text
        const displayText = this.getDisplayText(cleanUrl);

        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${displayText}</a>${trailing}`;
    }

    /**
     * Generate user-friendly display text for a URL
     * @param {string} url - Full URL
     * @returns {string} - Shortened display text
     */
    getDisplayText(url) {
        try {
            const urlObj = new URL(url);
            let displayText = urlObj.hostname.replace('www.', '');

            // Add path preview if present
            if (urlObj.pathname && urlObj.pathname !== '/') {
                const path = urlObj.pathname.length > 25
                    ? urlObj.pathname.substring(0, 25) + '...'
                    : urlObj.pathname;
                displayText += path;
            }

            return displayText;
        } catch (e) {
            // If URL parsing fails, truncate the raw URL
            return url.length > 40 ? url.substring(0, 40) + '...' : url;
        }
    }

    /**
     * Validate response structure matches expected Pydantic model
     * @param {object} response - API response object
     * @returns {object} - Validated response or error
     */
    validateResponse(response) {
        const errors = [];

        if (!response || typeof response !== 'object') {
            return { valid: false, errors: ['Response must be an object'] };
        }

        if (typeof response.answer !== 'string') {
            errors.push('answer field must be a string');
        }

        // session_id can be string, null, or undefined
        if (response.session_id !== undefined && response.session_id !== null && typeof response.session_id !== 'string') {
            errors.push('session_id must be a string, null, or undefined');
        }

        if (response.sources !== undefined && response.sources !== null) {
            if (!Array.isArray(response.sources)) {
                errors.push('sources must be an array if provided');
            } else if (!response.sources.every(s => typeof s === 'string')) {
                errors.push('all sources must be strings');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            data: errors.length === 0 ? {
                answer: response.answer,
                session_id: response.session_id || null,
                sources: response.sources || []
            } : null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageParser;
} else {
    window.MessageParser = MessageParser;
}
