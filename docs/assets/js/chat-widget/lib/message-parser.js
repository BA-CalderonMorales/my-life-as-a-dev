/**
 * MessageParser - Handles parsing and formatting of chat messages
 *
 * This class converts raw text responses into formatted HTML, handling:
 * - Markdown headers (# h1, ## h2, ### h3, etc.)
 * - Markdown-style formatting (bold, italic)
 * - Markdown links [text](url)
 * - Bullet points and nested lists
 * - Raw URLs and email links
 * - Proper escaping for XSS prevention
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
            // Bold: **text** or __text__
            bold: /\*\*([^*]+)\*\*|__([^_]+)__/g,
            // Italic: *text* or _text_ (but not inside bold)
            italic: /(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)/g,
            // URL pattern (raw URLs)
            url: /(https?:\/\/[^\s<>"'\)\]]+)/g,
            // Markdown link pattern: [text](url)
            markdownLink: /\[([^\]]+)\]\(([^)]+)\)/g,
            // Email pattern
            email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
            // Bullet point line: starts with * or - followed by space
            bulletLine: /^[\s]*[\*\-]\s+(.+)$/,
            // Numbered list: starts with number followed by . or )
            numberedLine: /^[\s]*(\d+)[\.\)]\s+(.+)$/,
            // Headers: lines starting with # (h1-h6), space after # is optional
            headerLine: /^(#{1,6})\s*(.+)$/
        };

        // Punctuation that shouldn't be part of URLs
        this.trailingPunctuation = ['.', ',', '!', '?', ')', ']', ';', ':', "'", '"'];
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

        // Step 1: Escape HTML to prevent XSS
        let result = this.escapeHtml(text);

        // Step 2: Parse markdown links FIRST (before line-based processing)
        // This prevents normalization from breaking [text](url) patterns
        result = this.parseMarkdownLinks(result);

        // Step 3: Parse structured content (headers, lists)
        result = this.parseStructuredContent(result);

        // Step 4: Parse inline formatting (bold, italic)
        result = this.parseInlineFormatting(result);

        // Step 5: Parse raw URLs and emails
        result = this.parseRawLinks(result);

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
     * Parse structured content like bullet points and numbered lists
     * @param {string} text - Text to parse
     * @returns {string} - Text with HTML lists
     */
    parseStructuredContent(text) {
        // Normalize line breaks - handle both \n and inline patterns
        let normalized = this.normalizeHeaders(text);
        normalized = this.normalizeBulletPoints(normalized);

        // Split into lines
        const lines = normalized.split('\n');
        const result = [];
        let currentList = null;
        let listType = null;

        for (const line of lines) {
            const trimmed = line.trim();

            // Check for header first (before checking lists)
            const headerMatch = trimmed.match(this.patterns.headerLine);
            if (headerMatch) {
                // Close any open list
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
     * Normalize headers that might be inline
     * Ensures markdown headers are on their own lines
     * @param {string} text - Text to normalize
     * @returns {string} - Normalized text with proper line breaks before headers
     */
    normalizeHeaders(text) {
        // Add newline before markdown headers
        // Handles both "text:### Header" and "text:#1. Header" (no space after #)
        // Only match after sentence-ending chars or word chars (not URL chars like / = & ")
        // Match #{1,6} followed by optional space and then word char or digit
        return text.replace(/([.!?:)\]a-zA-Z0-9])[^\S\n]*(#{1,6})[ \t]*(?=[a-zA-Z0-9])/g, '$1\n$2 ');
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
     * Parse markdown-style links [text](url) into anchor tags
     * This runs EARLY to protect links from being broken by normalization
     * @param {string} text - Text to parse
     * @returns {string} - Text with markdown links converted to HTML
     */
    parseMarkdownLinks(text) {
        return text.replace(this.patterns.markdownLink, (match, linkText, url) => {
            return this.createMarkdownLink(linkText, url);
        });
    }

    /**
     * Parse raw URLs and emails into clickable links
     * This runs LATE, after all other processing
     * @param {string} text - Text to parse
     * @returns {string} - Text with HTML links
     */
    parseRawLinks(text) {
        let result = text;

        // Replace raw URLs with clickable links (but not if already inside an anchor tag)
        result = result.replace(this.patterns.url, (url, offset) => {
            // Check if this URL is already part of an anchor tag (from markdown link)
            const beforeUrl = result.substring(Math.max(0, offset - 10), offset);
            if (beforeUrl.includes('href="') || beforeUrl.includes("href='")) {
                return url; // Already linked, don't double-link
            }
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
     * Create an HTML link from a markdown-style link
     * @param {string} linkText - Display text for the link
     * @param {string} url - URL to link to
     * @returns {string} - HTML anchor tag
     */
    createMarkdownLink(linkText, url) {
        // Clean up the URL - add protocol if missing
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('mailto:')) {
            cleanUrl = 'https://' + cleanUrl;
        }

        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${linkText}</a>`;
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
