"""
Pydantic models for the AI Chat Widget API.

These models define the expected request and response formats for the
chat widget's communication with the backend API. The JavaScript
MessageParser validates responses against these schemas.

Key Features:
- Structured response parsing with automatic hashtag extraction
- Consistent response normalization from raw LLM output
- Type validation for all fields

Usage:
    These models should be used in the Cloud Run backend to ensure
    consistent response formatting. The frontend JavaScript validates
    against the same schema and performs additional parsing.
"""

import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class ChatRequest(BaseModel):
    """
    Request model for chat messages sent from the frontend.

    Attributes:
        question: The user's question or message (required, max 500 chars)
        context: Page content for context awareness (optional, max 2000 chars)
        page_url: Current page URL for navigation help (optional)
        session_id: Session identifier for conversation continuity (optional)
    """
    question: str = Field(..., min_length=1, max_length=500)
    context: Optional[str] = Field(None, max_length=2000)
    page_url: Optional[str] = None
    session_id: Optional[str] = None


class ExtractedHashtag(BaseModel):
    """
    Represents a hashtag extracted from the response text.

    Attributes:
        tag: The hashtag text without the # symbol
        display: The display format with # symbol
        category: Optional category classification (e.g., 'skill', 'topic', 'project')
    """
    tag: str
    display: str
    category: Optional[str] = None


class StructuredContent(BaseModel):
    """
    Parsed and structured content from the LLM response.

    This model represents the processed output after extracting
    structured data from the raw LLM answer text.

    Attributes:
        text: The main response text (with hashtags removed for clean display)
        text_with_hashtags: Original text with hashtags intact
        hashtags: List of extracted hashtags
        has_list: Whether the response contains bullet/numbered lists
        has_code: Whether the response contains code blocks
        has_links: Whether the response contains URLs
    """
    text: str
    text_with_hashtags: str
    hashtags: List[ExtractedHashtag] = Field(default_factory=list)
    has_list: bool = False
    has_code: bool = False
    has_links: bool = False


class ChatResponse(BaseModel):
    """
    Response model for chat messages returned from the backend.

    The 'answer' field supports markdown-like formatting:
    - **bold text** or __bold text__
    - *italic text* or _italic text_
    - Bullet points with * or - prefix
    - Numbered lists with 1. or 1) prefix
    - URLs are auto-linked
    - Email addresses are auto-linked with mailto:
    - Hashtags (#tag) are extracted and formatted

    Attributes:
        answer: The AI's response with optional markdown formatting
        session_id: Session identifier for conversation continuity
        sources: List of source URLs referenced in the answer

    Example response:
        {
            "answer": "Brandon specializes in #Python and #JavaScript development.\\n* Backend: FastAPI, Django\\n* Frontend: React, Vue\\n\\nRelevant hashtags: #FullStack #WebDev",
            "session_id": "abc123-def456",
            "sources": ["https://brandoncalderon.dev/resume/"]
        }
    """
    answer: str = Field(..., min_length=1)
    session_id: Optional[str] = None
    sources: Optional[List[str]] = None

    @field_validator('answer')
    @classmethod
    def normalize_answer(cls, v: str) -> str:
        """Normalize the answer text for consistent parsing."""
        if not v:
            return v
        # Normalize line endings
        v = v.replace('\r\n', '\n').replace('\r', '\n')
        # Remove excessive blank lines (more than 2 consecutive)
        v = re.sub(r'\n{3,}', '\n\n', v)
        # Trim whitespace
        return v.strip()


class ParsedChatResponse(BaseModel):
    """
    Fully parsed and structured chat response.

    This is the final model after client-side processing. It contains
    both the raw response data and the extracted structured content.

    Attributes:
        raw_answer: Original answer text from the API
        content: Structured content with extracted elements
        session_id: Session identifier
        sources: List of source URLs
        metadata: Additional metadata about the response
    """
    raw_answer: str
    content: StructuredContent
    session_id: Optional[str] = None
    sources: List[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)

    @classmethod
    def from_chat_response(cls, response: ChatResponse) -> 'ParsedChatResponse':
        """
        Create a ParsedChatResponse from a raw ChatResponse.

        This performs the client-side parsing to extract structured
        content from the raw LLM response.
        """
        content = ResponseParser.parse(response.answer)
        return cls(
            raw_answer=response.answer,
            content=content,
            session_id=response.session_id,
            sources=response.sources or [],
            metadata={
                'hashtag_count': len(content.hashtags),
                'has_formatting': content.has_list or content.has_code or content.has_links
            }
        )


class ResponseParser:
    """
    Utility class for parsing raw LLM responses into structured content.

    This parser extracts:
    - Hashtags (#tag format)
    - Detects lists (bullet and numbered)
    - Detects code blocks
    - Detects URLs
    """

    # Pattern for hashtags: # followed by word characters, but not at start of line (headers)
    # and not inside URLs
    HASHTAG_PATTERN = re.compile(
        r'(?<![/\w])#([a-zA-Z][a-zA-Z0-9_]{1,30})(?![a-zA-Z0-9_/])',
        re.UNICODE
    )

    # Pattern for URLs
    URL_PATTERN = re.compile(
        r'https?://[^\s<>"\')\]]+',
        re.IGNORECASE
    )

    # Pattern for bullet lists
    BULLET_PATTERN = re.compile(r'^\s*[\*\-]\s+', re.MULTILINE)

    # Pattern for numbered lists
    NUMBERED_PATTERN = re.compile(r'^\s*\d+[\.\)]\s+', re.MULTILINE)

    # Pattern for code blocks
    CODE_PATTERN = re.compile(r'```[\s\S]*?```|`[^`]+`')

    # Common hashtag categories based on content
    CATEGORY_KEYWORDS = {
        'skill': ['python', 'javascript', 'typescript', 'react', 'vue', 'angular',
                  'nodejs', 'java', 'csharp', 'golang', 'rust', 'sql', 'html', 'css',
                  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'api', 'rest',
                  'graphql', 'mongodb', 'postgresql', 'mysql', 'redis', 'fastapi',
                  'django', 'flask', 'springboot', 'nextjs', 'tailwind'],
        'topic': ['webdev', 'backend', 'frontend', 'fullstack', 'devops', 'cloud',
                  'machinelearning', 'ml', 'ai', 'datascience', 'security', 'testing',
                  'agile', 'scrum', 'cicd', 'microservices', 'architecture'],
        'project': ['portfolio', 'demo', 'opensource', 'github', 'project', 'app',
                    'website', 'tool', 'library', 'framework']
    }

    @classmethod
    def parse(cls, text: str) -> StructuredContent:
        """
        Parse raw text into structured content.

        Args:
            text: Raw response text from the LLM

        Returns:
            StructuredContent with extracted elements
        """
        if not text:
            return StructuredContent(text='', text_with_hashtags='')

        # Extract hashtags
        hashtags = cls.extract_hashtags(text)

        # Create clean text (without hashtags for optional clean display)
        clean_text = cls.remove_hashtags(text)

        # Detect content types
        has_list = bool(cls.BULLET_PATTERN.search(text) or cls.NUMBERED_PATTERN.search(text))
        has_code = bool(cls.CODE_PATTERN.search(text))
        has_links = bool(cls.URL_PATTERN.search(text))

        return StructuredContent(
            text=clean_text.strip(),
            text_with_hashtags=text,
            hashtags=hashtags,
            has_list=has_list,
            has_code=has_code,
            has_links=has_links
        )

    @classmethod
    def extract_hashtags(cls, text: str) -> List[ExtractedHashtag]:
        """
        Extract all hashtags from text.

        Args:
            text: Raw text containing hashtags

        Returns:
            List of ExtractedHashtag objects
        """
        # First, remove URLs to avoid matching fragments
        text_without_urls = cls.URL_PATTERN.sub('', text)

        # Find all hashtag matches
        matches = cls.HASHTAG_PATTERN.findall(text_without_urls)

        # Deduplicate while preserving order
        seen = set()
        hashtags = []
        for tag in matches:
            tag_lower = tag.lower()
            if tag_lower not in seen:
                seen.add(tag_lower)
                category = cls.categorize_hashtag(tag_lower)
                hashtags.append(ExtractedHashtag(
                    tag=tag,
                    display=f'#{tag}',
                    category=category
                ))

        return hashtags

    @classmethod
    def categorize_hashtag(cls, tag: str) -> Optional[str]:
        """
        Categorize a hashtag based on known keywords.

        Args:
            tag: Hashtag text (without #)

        Returns:
            Category string or None
        """
        tag_lower = tag.lower()
        for category, keywords in cls.CATEGORY_KEYWORDS.items():
            if tag_lower in keywords:
                return category
        return None

    @classmethod
    def remove_hashtags(cls, text: str) -> str:
        """
        Remove hashtags from text for clean display.

        Args:
            text: Text with hashtags

        Returns:
            Text with hashtags removed
        """
        # Remove hashtags but keep the rest of the text clean
        result = cls.HASHTAG_PATTERN.sub('', text)
        # Clean up any double spaces left behind
        result = re.sub(r'  +', ' ', result)
        # Clean up empty lines that might result from hashtag-only lines
        result = re.sub(r'\n\s*\n\s*\n', '\n\n', result)
        return result


class FormattingGuidelines:
    """
    Guidelines for formatting AI responses to ensure proper rendering.

    The frontend MessageParser handles the following formatting:

    1. BOLD TEXT:
       Use **text** or __text__ for bold.
       Example: "Contact **Brandon** for more info."

    2. ITALIC TEXT:
       Use *text* or _text_ for italics (single asterisk/underscore).
       Example: "This is *important* information."

    3. BULLET POINTS:
       Start lines with * or - followed by a space.
       Use newlines to separate items for best results.
       Example:
           "Here are the options:\\n* Option one\\n* Option two\\n* Option three"

    4. NUMBERED LISTS:
       Start lines with a number followed by . or ) and a space.
       Example:
           "Steps to follow:\\n1. First step\\n2. Second step\\n3. Third step"

    5. LINKS:
       Include full URLs (https://...) - they are auto-linked.
       Example: "Visit https://github.com/BA-CalderonMorales"

    6. EMAIL ADDRESSES:
       Include email addresses directly - they are auto-linked with mailto:.
       Example: "Email b.dev.c.m@gmail.com for inquiries."

    7. HASHTAGS:
       Use #tag format for topic tags. They will be extracted and styled.
       - Must start with a letter
       - Can contain letters, numbers, and underscores
       - 2-31 characters after the #
       Example: "Brandon works with #Python #FastAPI and #React"

       Hashtag categories (automatically detected):
       - Skills: #Python, #JavaScript, #Docker, #AWS, etc.
       - Topics: #WebDev, #FullStack, #DevOps, etc.
       - Projects: #Portfolio, #OpenSource, etc.

    IMPORTANT: Always use \\n for newlines in JSON responses to ensure
    proper parsing. Avoid inline bullet patterns like "text: * item1 * item2"
    as they may not parse correctly.
    """
    pass


# JavaScript schema for frontend validation
JAVASCRIPT_SCHEMA = """
/**
 * TypeScript/JavaScript schema matching the Pydantic models.
 * Use this for frontend type checking and validation.
 */

interface ExtractedHashtag {
    tag: string;
    display: string;
    category: 'skill' | 'topic' | 'project' | null;
}

interface StructuredContent {
    text: string;
    text_with_hashtags: string;
    hashtags: ExtractedHashtag[];
    has_list: boolean;
    has_code: boolean;
    has_links: boolean;
}

interface ChatRequest {
    question: string;
    context?: string;
    page_url?: string;
    session_id?: string;
}

interface ChatResponse {
    answer: string;
    session_id?: string;
    sources?: string[];
}

interface ParsedChatResponse {
    raw_answer: string;
    content: StructuredContent;
    session_id: string | null;
    sources: string[];
    metadata: {
        hashtag_count: number;
        has_formatting: boolean;
    };
}
"""


# Example usage in backend:
"""
from models import ChatRequest, ChatResponse, ParsedChatResponse

@app.post("/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    # Process the request with Gemini
    answer = generate_response(request.question, request.context)

    return ChatResponse(
        answer=answer,
        session_id=request.session_id or generate_session_id(),
        sources=[]
    )

# Client-side parsing example (Python version):
response = ChatResponse(answer="Learn #Python and #FastAPI for backend!")
parsed = ParsedChatResponse.from_chat_response(response)
print(parsed.content.hashtags)  # [ExtractedHashtag(tag='Python', ...), ...]
"""
