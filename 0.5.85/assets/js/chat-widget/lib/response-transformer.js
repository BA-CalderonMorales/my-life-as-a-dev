/**
 * ResponseTransformer - Central response processing for consistent LLM output handling
 *
 * This module provides a single point of transformation for API responses,
 * ensuring consistent parsing, validation, and structuring of LLM outputs.
 *
 * Key Features:
 * - Normalizes raw API responses to a consistent structure
 * - Extracts and categorizes hashtags
 * - Validates response format against expected schema
 * - Provides both raw and parsed content for flexible UI rendering
 *
 * This mirrors the Python Pydantic models (models.py) to ensure frontend/backend
 * consistency without requiring backend changes.
 */

const ResponseTransformer = {
    /**
     * Category keywords for hashtag classification
     * Must stay in sync with models.py CATEGORY_KEYWORDS
     */
    CATEGORY_KEYWORDS: {
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
    },

    /**
     * Regex patterns for content detection
     */
    PATTERNS: {
        // Hashtag: # followed by letter, then alphanumeric/underscore (2-31 chars)
        hashtag: /(?<![\/\w])#([a-zA-Z][a-zA-Z0-9_]{1,30})(?![a-zA-Z0-9_\/])/g,
        // URL pattern
        url: /(https?:\/\/[^\s<>"'\)\]]+)/gi,
        // Bullet list
        bulletList: /^\s*[\*\-]\s+/m,
        // Numbered list
        numberedList: /^\s*\d+[\.\)]\s+/m,
        // Code block
        codeBlock: /```[\s\S]*?```|`[^`]+`/
    },

    /**
     * Transform raw API response into a structured, consistent format
     *
     * @param {object} rawResponse - Raw API response { answer, session_id?, sources? }
     * @returns {object} - Structured response with parsed content
     */
    transform(rawResponse) {
        // Validate basic structure
        const validation = this.validate(rawResponse);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', '),
                data: null
            };
        }

        const normalizedAnswer = this.normalizeText(rawResponse.answer);

        // Extract structured content
        const content = this.parseContent(normalizedAnswer);

        return {
            success: true,
            error: null,
            answer: normalizedAnswer,
            data: {
                // Raw data from API
                raw_answer: rawResponse.answer,

                // Structured content
                content: content,

                // Session management
                session_id: rawResponse.session_id || null,

                // Sources
                sources: rawResponse.sources || [],

                // Metadata for analytics/debugging
                metadata: {
                    hashtag_count: content.hashtags.length,
                    has_formatting: content.has_list || content.has_code || content.has_links,
                    response_length: normalizedAnswer.length,
                    timestamp: new Date().toISOString()
                }
            }
        };
    },

    /**
     * Validate raw API response against expected schema
     *
     * @param {object} response - Raw API response
     * @returns {object} - { valid: boolean, errors: string[] }
     */
    validate(response) {
        const errors = [];

        if (!response || typeof response !== 'object') {
            return { valid: false, errors: ['Response must be an object'] };
        }

        if (typeof response.answer !== 'string') {
            errors.push('answer field must be a string');
        } else if (response.answer.trim().length === 0) {
            errors.push('answer field cannot be empty');
        }

        if (response.session_id !== undefined &&
            response.session_id !== null &&
            typeof response.session_id !== 'string') {
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
            errors
        };
    },

    /**
     * Normalize text for consistent parsing
     *
     * @param {string} text - Raw text
     * @returns {string} - Normalized text
     */
    normalizeText(text) {
        if (!text) return '';

        // Normalize line endings
        let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        normalized = this.normalizeMarkdownTables(normalized);
        normalized = normalized.replace(/<br\s*\/?>/gi, '\n');

        // Remove excessive blank lines (more than 2 consecutive)
        normalized = normalized.replace(/\n{3,}/g, '\n\n');

        // Trim whitespace
        return normalized.trim();
    },

    /**
     * Parse text content into structured data
     *
     * @param {string} text - Normalized text
     * @returns {object} - StructuredContent object
     */
    normalizeMarkdownTables(text) {
        const lines = text.split('\n');
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = lines[i + 1] || '';

            if (this.isMarkdownTableHeader(line, nextLine)) {
                const headers = this.parseMarkdownTableRow(line);
                i += 2;

                while (i < lines.length && this.isMarkdownTableRow(lines[i])) {
                    const cells = this.parseMarkdownTableRow(lines[i]);
                    const title = cells[0] || 'Item';
                    const details = [];

                    for (let column = 1; column < cells.length; column++) {
                        const header = headers[column] || `Detail ${column}`;
                        const value = cells[column];
                        if (value) details.push(`${header}: ${value}`);
                    }

                    result.push(`- **${title}**${details.length ? ` - ${details.join(' ')}` : ''}`);
                    i++;
                }

                i--;
                continue;
            }

            result.push(line);
        }

        return result.join('\n');
    },

    isMarkdownTableHeader(line, nextLine) {
        return this.isMarkdownTableRow(line) && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(nextLine);
    },

    isMarkdownTableRow(line) {
        return /^\s*\|.*\|\s*$/.test(line);
    },

    parseMarkdownTableRow(line) {
        return line
            .trim()
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((cell) => cell.trim().replace(/\s+/g, ' '))
            .filter((cell) => cell.length > 0);
    },

    parseContent(text) {
        if (!text) {
            return {
                text: '',
                text_with_hashtags: '',
                hashtags: [],
                has_list: false,
                has_code: false,
                has_links: false
            };
        }

        // Extract hashtags
        const hashtags = this.extractHashtags(text);

        // Create clean text (hashtags removed for optional clean display)
        const cleanText = this.removeHashtags(text);

        // Detect content types
        const hasList = this.PATTERNS.bulletList.test(text) ||
            this.PATTERNS.numberedList.test(text);
        const hasCode = this.PATTERNS.codeBlock.test(text);
        const hasLinks = this.PATTERNS.url.test(text);

        return {
            text: cleanText,
            text_with_hashtags: text,
            hashtags: hashtags,
            has_list: hasList,
            has_code: hasCode,
            has_links: hasLinks
        };
    },

    /**
     * Extract hashtags from text
     *
     * @param {string} text - Text containing hashtags
     * @returns {Array} - Array of extracted hashtag objects
     */
    extractHashtags(text) {
        if (!text) return [];

        // Remove URLs first to avoid matching URL fragments
        const textWithoutUrls = text.replace(this.PATTERNS.url, '');

        const hashtags = [];
        const seen = new Set();
        let match;

        // Reset regex state
        this.PATTERNS.hashtag.lastIndex = 0;

        while ((match = this.PATTERNS.hashtag.exec(textWithoutUrls)) !== null) {
            const tag = match[1];
            const tagLower = tag.toLowerCase();

            if (!seen.has(tagLower)) {
                seen.add(tagLower);
                hashtags.push({
                    tag: tag,
                    display: `#${tag}`,
                    category: this.categorizeHashtag(tagLower)
                });
            }
        }

        return hashtags;
    },

    /**
     * Categorize a hashtag based on known keywords
     *
     * @param {string} tag - Lowercase tag text (without #)
     * @returns {string|null} - Category or null
     */
    categorizeHashtag(tag) {
        for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
            if (keywords.includes(tag)) {
                return category;
            }
        }
        return null;
    },

    /**
     * Remove hashtags from text for clean display
     *
     * @param {string} text - Text with hashtags
     * @returns {string} - Text without hashtags
     */
    removeHashtags(text) {
        if (!text) return '';

        // Reset regex state
        this.PATTERNS.hashtag.lastIndex = 0;

        let result = text.replace(this.PATTERNS.hashtag, '');

        // Clean up double spaces
        result = result.replace(/  +/g, ' ');

        // Clean up excessive empty lines
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');

        return result.trim();
    },

    /**
     * Get a summary of the response for logging/debugging
     *
     * @param {object} transformedResponse - Output from transform()
     * @returns {object} - Summary object
     */
    getSummary(transformedResponse) {
        if (!transformedResponse.success) {
            return {
                status: 'error',
                error: transformedResponse.error
            };
        }

        const data = transformedResponse.data;
        return {
            status: 'success',
            answer_length: data.raw_answer.length,
            hashtag_count: data.content.hashtags.length,
            hashtags: data.content.hashtags.map(h => h.display),
            has_list: data.content.has_list,
            has_code: data.content.has_code,
            has_links: data.content.has_links,
            session_id: data.session_id ? 'present' : 'none',
            sources_count: data.sources.length
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponseTransformer;
} else {
    window.ResponseTransformer = ResponseTransformer;
}
