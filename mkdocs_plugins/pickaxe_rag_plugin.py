import logging
import os
import re

from dotenv import load_dotenv
from mkdocs.plugins import BasePlugin
import requests

log = logging.getLogger("mkdocs.plugins.pickaxe_rag")

class PickaxeRAGPlugin(BasePlugin):
    """Plugin that replaces placeholders with Pickaxe RAG answers."""

    def on_config(self, config):
        load_dotenv()
        self.api_key = os.environ.get("PICKAXE_API_KEY")
        self.host = os.environ.get("PICKAXE_HOST", "https://api.pickaxe.ai")
        if not self.api_key:
            log.warning("Pickaxe RAG: No API key set. Placeholders will remain unchanged.")
        return config

    def on_page_markdown(self, markdown, page, config, files):
        pattern = re.compile(r'<div class="pickaxe-rag" data-query="(.*?)">.*?</div>', re.DOTALL)

        def repl(match):
            query = match.group(1)
            if not self.api_key:
                return match.group(0)
            try:
                resp = requests.post(
                    f"{self.host}/rag",
                    json={"query": query, "doc": page.file.src_path},
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=30,
                )
                if resp.ok:
                    data = resp.json()
                    return data.get("answer", match.group(0))
                log.error("Pickaxe RAG: API error %s", resp.status_code)
            except Exception as exc:
                log.error("Pickaxe RAG: request failed: %s", exc)
            return match.group(0)

        return pattern.sub(repl, markdown)


def get_plugin():
    return PickaxeRAGPlugin()
