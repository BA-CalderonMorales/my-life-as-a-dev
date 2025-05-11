--- 
hide:
  - toc
---

# AI Playground

Welcome to the AI Playground, where you can leverage AI to explore repositories, create interactive 3D scenes, and get assistance with your code. Select a mode to get started!

<div class="ai-alert ai-alert-info">
    <p class="ai-alert-title">OpenAI API Key</p>
    <p>Ensure your OpenAI API key is securely handled server-side (e.g., via environment variables). This playground does not handle API keys on the client side.</p>
</div>

<ai-playground mode="repo-explorer"></ai-playground>

## Features

*   **Repository Explorer**: Get AI-powered insights about your GitHub repositories. Analyze code structure, assess documentation quality, receive feature recommendations, and more.
*   **Scene Creator**: Generate and preview Three.js 3D scenes using natural language prompts. Edit the generated code and see live updates.
*   **Code Assistant**: Get help understanding, documenting, and improving your code. Ask the AI to explain code snippets, generate documentation, suggest refactorings, or identify potential bugs.

## How to Use

1.  **Select a Mode**: Use the tabs at the top of the AI Playground (Repository Explorer, Scene Creator, Code Assistant) to choose your desired tool.
2.  **Follow Instructions**: Each mode has specific inputs and controls. 
    *   For **Repository Explorer**, select a repository and the types of insights you want.
    *   For **Scene Creator**, describe the scene you envision and optionally use example prompts.
    *   For **Code Assistant**, paste your code and select the task for the AI.
3.  **Interact**: Click the relevant buttons (e.g., "Analyze Repository", "Generate Scene", "Process Code") to send your request to the AI.
4.  **View Results**: The AI's response will be displayed in the designated results area for each mode.

*Note: AI generation may take a few moments depending on the complexity of the request and API response times.* 

## Technical Details

This playground utilizes a custom web component (`<ai-playground>`) that dynamically loads content and interacts with backend API endpoints (not yet implemented in this example) for AI processing. The component manages different states for each mode (Repository Explorer, Scene Creator, Code Assistant) and fetches HTML templates for their UIs.

*   **Styling**: Component-specific styles are located in `docs/assets/css/components/aiPlayground/aiPlayground.css`.
*   **JavaScript Logic**: The core logic for the component is in `docs/assets/js/components/aiPlayground/aiPlayground.js`.
*   **HTML Templates**: UI templates for each mode are in `docs/assets/templates/` (`repo-explorer.html`, `scene-creator.html`, `code-assistant.html`).

### Security Note:
Your OpenAI API key should be configured on a backend server that proxies requests to the OpenAI API. **Never expose your API key directly in client-side code.** The `open_ai_page_profile.json` outlines this with `"clientSideKeyHandling": false` and `"useProxyEndpoint": true`.
