"""
MkDocs plugins package

This package contains custom plugins for MkDocs.
Currently includes:
- AI Plugin: For AI-assisted content generation
- PickaxeRAGPlugin: Integrates Pickaxe for Retrieval Augmented Generation
"""

# Version of the plugins package
__version__ = "0.1.0"

# Expose the AIPlugin class at the package level for easier imports
try:
    from mkdocs_plugins.ai_plugin import AIPlugin
    from mkdocs_plugins.pickaxe_rag_plugin import PickaxeRAGPlugin

    __all__ = ["AIPlugin", "PickaxeRAGPlugin"]
except ImportError:
    # This allows the package to be imported even if submodules are missing
    # (helps with module discovery)
    pass
