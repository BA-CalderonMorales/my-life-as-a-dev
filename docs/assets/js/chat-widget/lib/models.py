"""
Pydantic models for the AI Chat Widget API.

These models define the expected request and response formats for the 
chat widget's communication with the backend API. The JavaScript 
MessageParser validates responses against these schemas.

Usage:
    These models should be used in the Cloud Run backend to ensure
    consistent response formatting. The frontend JavaScript validates
    against the same schema.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


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
    
    Attributes:
        answer: The AI's response with optional markdown formatting
        session_id: Session identifier for conversation continuity
        sources: List of source URLs referenced in the answer
    
    Example response:
        {
            "answer": "You can reach Brandon through:\\n* **LinkedIn:** https://linkedin.com/in/bcalderonmorales-cmoe/\\n* **Email:** b.dev.c.m@gmail.com\\n* **GitHub:** https://github.com/BA-CalderonMorales",
            "session_id": "abc123-def456",
            "sources": ["https://brandoncalderon.dev/resume/"]
        }
    """
    answer: str = Field(..., min_length=1)
    session_id: Optional[str] = None
    sources: Optional[List[str]] = None


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
    
    IMPORTANT: Always use \\n for newlines in JSON responses to ensure
    proper parsing. Avoid inline bullet patterns like "text: * item1 * item2"
    as they may not parse correctly.
    """
    pass


# Example usage in backend:
"""
from models import ChatRequest, ChatResponse

@app.post("/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    # Process the request
    answer = generate_response(request.question, request.context)
    
    return ChatResponse(
        answer=answer,
        session_id=request.session_id or generate_session_id(),
        sources=[]
    )
"""
