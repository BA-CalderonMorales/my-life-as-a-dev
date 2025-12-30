/**
 * Chat Widget Module Index
 * 
 * This module provides a modular architecture for the AI chat widget.
 * Components are separated for maintainability and testability.
 * 
 * Components:
 * - MessageParser: Handles markdown parsing and link rendering
 * - (Future) ResponseValidator: Pydantic-compatible response validation
 * - (Future) SessionManager: Handle session state
 * 
 * Expected API Response Format (Pydantic model):
 * 
 * class ChatResponse(BaseModel):
 *     answer: str
 *     session_id: Optional[str] = None
 *     sources: Optional[List[str]] = None
 *     
 * class ChatRequest(BaseModel):
 *     question: str
 *     context: Optional[str] = None
 *     page_url: Optional[str] = None
 *     session_id: Optional[str] = None
 */

// Re-export components for easy access
// In browser context, these are attached to window object
// In Node.js context (for testing), these are module.exports

(function () {
    // Check if we're in a browser or Node.js environment
    const isBrowser = typeof window !== 'undefined';

    if (isBrowser) {
        // Browser: Components are loaded via script tags and attached to window
        window.ChatWidget = window.ChatWidget || {};

        // Reference the MessageParser if it's already loaded
        if (window.MessageParser) {
            window.ChatWidget.MessageParser = window.MessageParser;
        }
    }
})();
