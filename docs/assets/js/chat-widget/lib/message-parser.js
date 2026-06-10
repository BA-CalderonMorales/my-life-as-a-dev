/**
 * MessageParser - Handles parsing and formatting of chat messages
 *
 * This class converts raw text responses into formatted HTML, handling:
 * - Markdown links [text](url)
 * - Markdown-style formatting (bold, italic)
 * - Bullet points and numbered lists
 * - URLs and email links
 * - Hashtags with categorization and styling
 * - Proper escaping for XSS prevention
 *
 * Parsing Strategy (Placeholder-Based):
 * The parser uses placeholders to protect markdown links and hashtags from
 * corruption during intermediate transformations. Placeholders use null
 * characters (\x00) which won't appear in normal text and won't match patterns.
 *
 * Order of operations:
 * 1. Extract markdown links → store with placeholders (protects [text](url))
 * 2. Extract hashtags → store with placeholders (protects #tag)
 * 3. Escape HTML (XSS prevention)
 * 4. Parse inline formatting (bold, italic)
 * 5. Parse structured content (lists, paragraphs)
 * 6. Parse raw URLs and emails
 * 7. Restore hashtags from placeholders (with styling)
 * 8. Restore markdown links from placeholders
 *
 * Structured Response Model (mirrors Pydantic models.py):
 * {
 *   raw_answer: string,
 *   content: {
 *     text: string,              // Clean text without hashtags
 *     text_with_hashtags: string, // Original text
 *     hashtags: ExtractedHashtag[],
 *     has_list: boolean,
 *     has_code: boolean,
 *     has_links: boolean
 *   },
 *   session_id: string | null,
 *   sources: string[],
 *   metadata: { hashtag_count: number, has_formatting: boolean }
 * }
 */
class MessageParser {
    constructor() {
        // Patterns for markdown parsing
        this.patterns = {
            // Markdown link: [text](url)
            markdownLink: /\[([^\]]+)\]\(([^)]+)\)/g,
            // Bold: **text** or __text__ (non-greedy match to allow inner characters)
            bold: /\*\*(.*?)\*\*|__(.*?)__/g,
            // Italic: *text* or _text_ (but not inside bold)
            italic: /(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)/g,
            // URL pattern (but not already in href or markdown link)
            url: /(https?:\/\/[^\s<>"'\)\]]+)/g,
            // Email pattern
            email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
            // Bullet point line: starts with * or - followed by space
            bulletLine: /^[\s]*[\*\-]\s+(.+)$/,
            // Numbered list: starts with number followed by . or )
            numberedLine: /^[\s]*(\d+)[\.\)]\s+(.+)$/,
            // Markdown headers: # to ###### followed by space and text
            // Captures: [1] = number of # signs, [2] = header text
            headerLine: /^(#{1,6})\s+(.+)$/,
            // Hashtag: # followed by letter, then alphanumeric/underscore (2-31 chars total)
            // Not preceded by / or word char, not followed by word char or /
            hashtag: /(?<![\/\w])#([a-zA-Z][a-zA-Z0-9_]{1,30})(?![a-zA-Z0-9_\/])/g
        };

        // Punctuation that shouldn't be part of URLs
        this.trailingPunctuation = ['.', ',', '!', '?', ')', ']', ';', ':', "'", '"'];

        // Placeholder storage for protected content
        // Using null character delimiters that won't appear in text or match patterns
        this.placeholders = new Map();
        this.placeholderCounter = 0;

        // Hashtag categories for styling (mirrors Pydantic model)
        this.categoryKeywords = {
            skill: ['python', 'javascript', 'typescript', 'react', 'vue', 'angular',
                'nodejs', 'java', 'csharp', 'golang', 'rust', 'sql', 'html', 'css',
                'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'api', 'rest',
                'graphql', 'mongodb', 'postgresql', 'mysql', 'redis', 'fastapi',
                'django', 'flask', 'springboot', 'nextjs', 'tailwind'],
            topic: ['webdev', 'backend', 'frontend', 'fullstack', 'devops', 'cloud',
                'machinelearning', 'ml', 'ai', 'datascience', 'security', 'testing',
                'agile', 'scrum', 'cicd', 'microservices', 'architecture'],
            project: ['portfolio', 'demo', 'opensource', 'github', 'project', 'app',
                'website', 'tool', 'library', 'framework']
        };
        // Pattern for code blocks
        this.patterns.codeBlock = /```([\s\S]*?)```/g;
        // Pattern for inline code
        this.patterns.inlineCode = /`([^`]+)`/g;
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

        // Normalize the text first
        text = this.normalizeText(text);

        // Reset placeholder storage for each parse
        this.placeholders = new Map();
        this.placeholderCounter = 0;

        // Step 0: Extract and protect code blocks FIRST (prevents markdown inside code being parsed)
        let result = this.extractCodeBlocks(text);

        // Step 1: Extract and protect markdown links with placeholders
        result = this.extractMarkdownLinks(result);

        // Step 2: Extract and protect hashtags with placeholders
        result = this.extractHashtags(result);

        // Step 3: Escape HTML to prevent XSS (except for placeholders)
        result = this.escapeHtml(result);

        // Step 4: Parse inline formatting (bold, italic)
        result = this.parseInlineFormatting(result);

        // Step 5: Parse structured content (lists, paragraphs)
        result = this.parseStructuredContent(result);

        // Step 6: Parse raw links (URLs and emails not in markdown format)
        result = this.parseLinks(result);

        // Step 7: Restore hashtags from placeholders (with styling)
        result = this.restoreHashtagPlaceholders(result);

        // Step 8: Restore markdown links from placeholders
        result = this.restorePlaceholders(result);

        // Step 9: Restore code blocks (LAST)
        result = this.restoreCodePlaceholders(result);

        return result;
    }

    /**
     * Extract code blocks and inline code, replace with placeholders
     * @param {string} text - Raw text
     * @returns {string} - Text with placeholders
     */
    extractCodeBlocks(text) {
        // 1. Block code ```code```
        let result = text.replace(this.patterns.codeBlock, (match, content) => {
            let lang = '';
            let code = content;
            
            // Check if content starts with a language identifier followed by a newline
            // Standard markdown: ```language\ncode```
            // The regex captures everything inside ```...```, so we look at the start of content
            const firstLineMatch = content.match(/^([a-zA-Z0-9_+-]+)\n/);
            
            if (firstLineMatch) {
                // It looks like a language identifier
                lang = firstLineMatch[1];
                // Remove the language identifier and the newline from the code
                code = content.substring(firstLineMatch[0].length);
            } else if (content.startsWith('\n')) {
                // Handle case where there's just a newline (no language)
                // ```
                // code
                // ```
                code = content.substring(1);
            }

            const placeholder = `\x00CODEBLOCK${this.placeholderCounter++}\x00`;
            // Trim leading/trailing whitespace from code content, but preserve internal formatting
            // We trim only the very start and end of the block to avoid extra newlines
            // but we don't use .trim() because it might remove indentation
            
            this.placeholders.set(placeholder, { 
                type: 'code_block', 
                lang: lang,
                code: code 
            });
            return placeholder;
        });

        // 2. Inline code `code`
        result = result.replace(this.patterns.inlineCode, (match, code) => {
            const placeholder = `\x00INLINECODE${this.placeholderCounter++}\x00`;
            this.placeholders.set(placeholder, { 
                type: 'inline_code', 
                code: code 
            });
            return placeholder;
        });

        return result;
    }

    /**
     * Restore code placeholders with styled HTML
     * @param {string} text - Text with placeholders
     * @returns {string} - Text with HTML pre/code tags
     */
    restoreCodePlaceholders(text) {
        let result = text;
        for (const [placeholder, info] of this.placeholders) {
            if (info.type === 'code_block') {
                // Escape HTML characters inside the code to display them literally
                const escapedCode = this.escapeHtmlOnly(info.code);
                // Add language class if present
                const langAttr = info.lang ? ` class="language-${info.lang}"` : '';
                const html = `<pre><code${langAttr}>${escapedCode}</code></pre>`;
                result = result.split(placeholder).join(html);
            } else if (info.type === 'inline_code') {
                const escapedCode = this.escapeHtmlOnly(info.code);
                const html = `<code>${escapedCode}</code>`;
                result = result.split(placeholder).join(html);
            }
        }
        return result;
    }

    /**
     * Helper to escape HTML characters without wrapping in div
     */
    escapeHtmlOnly(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Normalize text for consistent parsing (mirrors Pydantic validator)

     * @param {string} text - Raw text
     * @returns {string} - Normalized text
     */
    normalizeText(text) {
        if (!text) return '';
        // Normalize line endings
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // Remove excessive blank lines (more than 2 consecutive)
        text = text.replace(/\n{3,}/g, '\n\n');
        // Expand known site paths and contact handles into full URLs before parsing.
        text = this.canonicalizeKnownReferences(text);
        // Trim whitespace
        return text.trim();
    }

    /**
     * Resolve the current docs base URL, preserving repo/version prefixes when present.
     * @returns {string} - Base URL ending with a trailing slash
     */
    getDocsBaseUrl() {
        const origin = window.location.origin;
        const pathname = window.location.pathname || '/';

        function ensureTrailingSlash(path) {
            return path.endsWith('/') ? path : path + '/';
        }

        const versionedMatch = pathname.match(/^\/my-life-as-a-dev\/(?:latest|\d+\.\d+\.\d+)(?:\/|$)/);
        if (versionedMatch) {
            return origin + ensureTrailingSlash(versionedMatch[0]);
        }

        const repoMatch = pathname.match(/^\/my-life-as-a-dev(?:\/|$)/);
        if (repoMatch) {
            return origin + ensureTrailingSlash(repoMatch[0]);
        }

        return origin + '/';
    }

    /**
     * Expand common site-relative paths and known contact handles into canonical URLs.
     * @param {string} text - Raw model output
     * @returns {string} - Text with canonical URLs in place
     */
    canonicalizeKnownReferences(text) {
        if (!text) return '';

        const docsBase = this.getDocsBaseUrl();

        function joinDocsPath(path) {
            return docsBase + path
                .replace(/^\/+/, '')
                .replace(/^my-life-as-a-dev\//, '');
        }

        const rootRelativeSitePath = /(^|[\s(>])((?:\/(?:projects|docs-as-code|learning|resume|canvas)(?:\/[a-zA-Z0-9._-]+)*\/?))/g;
        const repoRelativeSitePath = /(^|[\s(>])((?:my-life-as-a-dev\/(?:projects|docs-as-code|learning|resume|canvas)(?:\/[a-zA-Z0-9._-]+)*\/?))/g;

        return text
            .replace(rootRelativeSitePath, (match, prefix, path) => prefix + joinDocsPath(path))
            .replace(repoRelativeSitePath, (match, prefix, path) => prefix + joinDocsPath(path))
            .replace(/\bLinkedIn:\s*bcalderonmorales-cmoe\b/g, 'LinkedIn: https://www.linkedin.com/in/bcalderonmorales-cmoe/')
            .replace(/\bGitHub:\s*BA-CalderonMorales\b/g, 'GitHub: https://github.com/BA-CalderonMorales');
    }

    /**
     * Parse response into structured content (mirrors Pydantic ParsedChatResponse)
     * @param {object} response - Raw API response {answer, session_id, sources}
     * @returns {object} - Structured response with extracted content
     */
    parseStructuredResponse(response) {
        if (!response || typeof response.answer !== 'string') {
            return null;
        }

        const answer = this.normalizeText(response.answer);

        // Extract hashtags
        const hashtags = this.getHashtagsFromText(answer);

        // Create clean text (without hashtags)
        const cleanText = this.removeHashtagsFromText(answer);

        // Detect content types
        const hasList = this.patterns.bulletLine.test(answer) ||
            /^\s*\d+[\.\)]\s+/m.test(answer);
        const hasCode = /```[\s\S]*?```|`[^`]+`/.test(answer);
        const hasLinks = this.patterns.url.test(answer);

        return {
            raw_answer: response.answer,
            content: {
                text: cleanText,
                text_with_hashtags: answer,
                hashtags: hashtags,
                has_list: hasList,
                has_code: hasCode,
                has_links: hasLinks
            },
            session_id: response.session_id || null,
            sources: response.sources || [],
            metadata: {
                hashtag_count: hashtags.length,
                has_formatting: hasList || hasCode || hasLinks
            }
        };
    }

    /**
     * Extract hashtags from text without HTML conversion
     * @param {string} text - Raw text
     * @returns {Array} - Array of hashtag objects
     */
    getHashtagsFromText(text) {
        if (!text) return [];

        // Remove URLs first to avoid matching fragments
        const textWithoutUrls = text.replace(this.patterns.url, '');

        const matches = [];
        const seen = new Set();
        let match;

        // Reset regex state
        this.patterns.hashtag.lastIndex = 0;

        while ((match = this.patterns.hashtag.exec(textWithoutUrls)) !== null) {
            const tag = match[1];
            const tagLower = tag.toLowerCase();

            if (!seen.has(tagLower)) {
                seen.add(tagLower);
                matches.push({
                    tag: tag,
                    display: `#${tag}`,
                    category: this.categorizeHashtag(tagLower)
                });
            }
        }

        return matches;
    }

    /**
     * Remove hashtags from text for clean display
     * @param {string} text - Text with hashtags
     * @returns {string} - Text without hashtags
     */
    removeHashtagsFromText(text) {
        if (!text) return '';

        // Reset regex state
        this.patterns.hashtag.lastIndex = 0;

        let result = text.replace(this.patterns.hashtag, '');
        // Clean up double spaces
        result = result.replace(/  +/g, ' ');
        // Clean up empty lines
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
        return result.trim();
    }

    /**
     * Categorize a hashtag based on known keywords
     * @param {string} tag - Hashtag text (lowercase, without #)
     * @returns {string|null} - Category or null
     */
    categorizeHashtag(tag) {
        for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
            if (keywords.includes(tag)) {
                return category;
            }
        }
        return null;
    }

    /**
     * Extract markdown links and replace with placeholders
     * @param {string} text - Raw text
     * @returns {string} - Text with placeholders instead of markdown links
     */
    extractMarkdownLinks(text) {
        return text.replace(this.patterns.markdownLink, (match, linkText, url) => {
            const placeholder = `\x00LINK${this.placeholderCounter++}\x00`;
            this.placeholders.set(placeholder, { type: 'link', text: linkText, url: url });
            return placeholder;
        });
    }

    /**
     * Extract hashtags and replace with placeholders
     * @param {string} text - Text (may have link placeholders)
     * @returns {string} - Text with hashtag placeholders
     */
    extractHashtags(text) {
        // Reset regex state
        this.patterns.hashtag.lastIndex = 0;

        return text.replace(this.patterns.hashtag, (match, tag) => {
            const placeholder = `\x00TAG${this.placeholderCounter++}\x00`;
            const category = this.categorizeHashtag(tag.toLowerCase());
            this.placeholders.set(placeholder, { type: 'hashtag', tag: tag, category: category });
            return placeholder;
        });
    }

    /**
     * Restore hashtag placeholders with styled HTML
     * @param {string} text - Text with placeholders
     * @returns {string} - Text with styled hashtag spans
     */
    restoreHashtagPlaceholders(text) {
        let result = text;
        for (const [placeholder, info] of this.placeholders) {
            if (info.type === 'hashtag') {
                const categoryClass = info.category ? ` ai-chat-hashtag-${info.category}` : '';
                const span = `<span class="ai-chat-hashtag${categoryClass}" data-tag="${info.tag}">#${info.tag}</span>`;
                result = result.split(placeholder).join(span);
            }
        }
        return result;
    }

    /**
     * Restore link placeholders with actual HTML links
     * @param {string} text - Text with placeholders
     * @returns {string} - Text with HTML anchor tags
     */
    restorePlaceholders(text) {
        let result = text;
        for (const [placeholder, info] of this.placeholders) {
            if (info.type === 'link') {
                const safeUrl = this.getTrustedUrl(info.url);
                const escapedText = this.escapeHtml(info.text);
                const replacement = safeUrl
                    ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${escapedText}</a>`
                    : escapedText;
                result = result.split(placeholder).join(replacement);
            }
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

        // Handle repo-relative paths often generated by LLM (e.g. my-life-as-a-dev/canvas/)
        if (url.startsWith('my-life-as-a-dev/')) {
            return this.getDocsBaseUrl() + url.substring('my-life-as-a-dev/'.length);
        }

        // Handle site-relative paths within the docs repo/version.
        if (url.startsWith('/')) {
            return this.getDocsBaseUrl() + url.substring(1);
        }

        return 'https://' + url;
    }

    getTrustedUrl(url) {
        const safeUrl = this.ensureProtocol(url);
        return this.isTrustedUrl(safeUrl) ? safeUrl : null;
    }

    isTrustedUrl(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            const docsBase = new URL(this.getDocsBaseUrl());

            if (parsed.origin === window.location.origin) return true;
            if (parsed.origin === docsBase.origin && parsed.pathname.startsWith(docsBase.pathname)) return true;

            if (parsed.hostname === 'ba-calderonmorales.github.io') {
                return parsed.pathname.startsWith('/my-life-as-a-dev/');
            }

            if (parsed.hostname === 'github.com') {
                return parsed.pathname === '/BA-CalderonMorales' || parsed.pathname.startsWith('/BA-CalderonMorales/');
            }

            if (parsed.hostname === 'www.linkedin.com') {
                return parsed.pathname.replace(/\/$/, '') === '/in/bcalderonmorales-cmoe';
            }

            return false;
        } catch (error) {
            return false;
        }
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
     * @returns {string} - Text with HTML lists and paragraphs
     */
    parseStructuredContent(text) {
        // Normalize line breaks - handle both \n and inline bullet patterns
        const normalized = this.normalizeBulletPoints(text);

        // Split into lines
        const lines = normalized.split('\n');
        const result = [];
        let currentList = null;
        let listType = null;

        for (const line of lines) {
            const trimmed = line.trim();

            // Check for markdown header (### Title)
            const headerMatch = trimmed.match(this.patterns.headerLine);
            if (headerMatch) {
                // Close any open list first
                if (currentList !== null && currentList.length > 0) {
                    result.push(this.buildList(currentList, listType));
                    currentList = null;
                    listType = null;
                }
                // Convert to styled header with data-level for CSS differentiation
                const headerLevel = headerMatch[1].length;
                const headerText = headerMatch[2].trim();
                result.push(`<p class="ai-chat-content-header" data-level="${headerLevel}">${headerText}</p>`);
                continue;
            }

            // Check for bullet point
            const bulletMatch = trimmed.match(this.patterns.bulletLine);
            if (bulletMatch) {
                if (currentList === null || listType !== 'ul') {
                    if (currentList !== null && currentList.length > 0) {
                        result.push(this.buildList(currentList, listType));
                    }
                    currentList = [];
                    listType = 'ul';
                }
                currentList.push(bulletMatch[1].trim());
                continue;
            }

            // Check for numbered list
            const numberedMatch = trimmed.match(this.patterns.numberedLine);
            if (numberedMatch) {
                if (currentList === null || listType !== 'ol') {
                    if (currentList !== null && currentList.length > 0) {
                        result.push(this.buildList(currentList, listType));
                    }
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
     * @param {string} text - Text to normalize
     * @returns {string} - Normalized text with proper line breaks
     */
    normalizeBulletPoints(text) {
        let result = text;

        // Pattern for inline bullets after punctuation
        result = result.replace(/([.:!?])\s*\*\s+/g, '$1\n* ');
        result = result.replace(/([.:!?])\s*-\s+/g, '$1\n- ');

        // Handle when bullets follow each other inline
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
        let cleanUrl = url;
        let trailing = '';

        while (this.trailingPunctuation.includes(cleanUrl.slice(-1))) {
            trailing = cleanUrl.slice(-1) + trailing;
            cleanUrl = cleanUrl.slice(0, -1);
        }

        const trustedUrl = this.getTrustedUrl(cleanUrl);
        if (!trustedUrl) return cleanUrl + trailing;

        const displayText = this.getDisplayText(trustedUrl);

        return `<a href="${trustedUrl}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${displayText}</a>${trailing}`;
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

            if (urlObj.pathname && urlObj.pathname !== '/') {
                const path = urlObj.pathname.length > 25
                    ? urlObj.pathname.substring(0, 25) + '...'
                    : urlObj.pathname;
                displayText += path;
            }

            return displayText;
        } catch (e) {
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
        } else if (response.answer.trim().length === 0) {
            errors.push('answer field cannot be empty');
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

        if (errors.length > 0) {
            return { valid: false, errors, data: null };
        }

        // Normalize the answer
        const normalizedAnswer = this.normalizeText(response.answer);

        return {
            valid: true,
            errors: [],
            data: {
                answer: normalizedAnswer,
                session_id: response.session_id || null,
                sources: response.sources || []
            }
        };
    }

    /**
     * Get hashtags from the last parsed text (for UI display)
     * @returns {Array} - Array of hashtag objects from last parse
     */
    getLastParsedHashtags() {
        const hashtags = [];
        for (const [, info] of this.placeholders) {
            if (info.type === 'hashtag') {
                hashtags.push({
                    tag: info.tag,
                    display: `#${info.tag}`,
                    category: info.category
                });
            }
        }
        return hashtags;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageParser;
} else {
    window.MessageParser = MessageParser;
}
