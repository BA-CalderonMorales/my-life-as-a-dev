"""
MkDocs AI Plugin - Enhancing documentation with AI-generated content

This plugin injects a minimal, per-page chat UI that calls a local AI proxy
(`scripts/python/ai_proxy.py`) which uses GitHub Models via azure-ai-inference.
The chat is strictly constrained to the current page content: the page's raw
markdown is sent as context, and the model is asked to only answer from it.

Usage:
1. Add 'ai_plugin' to your plugins list in mkdocs.yml
2. Set OPENAI_API_KEY environment variable with your OpenAI API key
3. Add AI placeholders in your markdown files using the syntax:
   <div class="ai-placeholder" data-command="command_type" data-params="values">
     [Fallback content if AI generation fails]
   </div>

Environment Variables:
- OPENAI_API_KEY: Required for connecting to OpenAI API
- AI_MODEL: Optional, defaults to "gpt-4" (can be "gpt-3.5-turbo" for faster results)
- AI_TEMPERATURE: Optional, defaults to 0.7 (higher values = more creative outputs)

Future Development:
- Add support for more AI models and providers
- Implement caching to reduce API calls and costs
- Add more content generation commands and customization options
"""

import logging
import os

from dotenv import load_dotenv
from mkdocs.plugins import BasePlugin
from mkdocs.config.defaults import MkDocsConfig
from mkdocs.structure.pages import Page

# Initialize logger for this plugin
log = logging.getLogger("mkdocs.plugins.ai_plugin")


class AIPlugin(BasePlugin):
    """
    MkDocs plugin for AI-assisted content generation.

    This plugin integrates with OpenAI's API to help generate and refine documentation content.
    It processes special placeholder tags during the build process and replaces them with
    AI-generated content based on the specified commands.
    """

    def on_config(self, config: MkDocsConfig):
        """
        Initial setup when MkDocs loads the plugin.

        This method:
        1. Checks if the required OpenAI API key is available
        2. Logs information about the plugin's initialization status
        3. Will eventually set up the OpenAI client for later use

        Args:
            config: The MkDocs configuration dictionary

        Returns:
            config: The potentially modified configuration dictionary
        """
        log.info("AI Plugin: Initializing...")

        # Load environment variables from .env if present
        load_dotenv()

        # Optional: we use GITHUB_TOKEN for runtime proxy, but plugin can run without it
        if not os.environ.get("GITHUB_TOKEN"):
            log.warning("AI Plugin: GITHUB_TOKEN not set. The per-page chat will fail until it's provided.")

        return config

    def on_page_markdown(self, markdown: str, page: Page, config: MkDocsConfig, files):
        # Inject a collapsible per-page chat widget at the end of the page
        # The widget posts to the local ai_proxy at /chat with question + page content
        widget = """

<details>
<summary><b> Ask this page (AI)</b></summary>
<div style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-top: 10px;">
    <div style="display:flex; gap:8px; align-items:center; margin-bottom: 8px;">
        <input id="ai-q" type="text" placeholder="Ask a question about this page…" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;"/>
        <button id="ai-ask" style="padding:8px 12px;">Ask</button>
    </div>
    <div id="ai-a" style="white-space:pre-wrap; font-family: var(--md-text-font-family, system-ui, sans-serif);"></div>
    <small>Answers are restricted to this page content. Requires GITHUB_TOKEN set in environment.</small>
</div>

<script>
(() => {
    const btn = document.getElementById('ai-ask');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const q = document.getElementById('ai-q').value;
        const a = document.getElementById('ai-a');
        a.textContent = 'Thinking…';
        try {
            const res = await fetch('http://127.0.0.1:8765/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: q, context: document.body.innerText })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            a.textContent = data.answer || '(no answer)';
        } catch (e) {
            a.textContent = 'Error: ' + e;
        }
    });
})();
</script>

        """
        return markdown + "\n\n" + widget


def get_plugin():
    """
    Return the plugin object instance.

    This function is required by MkDocs plugin system to instantiate the plugin.
    """
    return AIPlugin()
