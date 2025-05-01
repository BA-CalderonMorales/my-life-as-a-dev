# Setup script for the MkDocs AI Plugin
# This file is essential for making the plugin installable via pip
# and for registering it with MkDocs' plugin system

from setuptools import setup, find_packages

setup(
    # Basic package metadata
    name="mkdocs_ai_plugin",  # The name under which the package will be installed
    version="0.1.0",          # Current version - follow semantic versioning
    description="MkDocs plugin for AI-assisted content generation",
    author="Brandon A. Calderon Morales",
    author_email="brandon.ceemoe@gmail.com",
    
    # Automatically find all Python packages in the directory
    packages=find_packages(),
    
    # Define plugin entry points - this is how MkDocs discovers the plugin
    # The format is 'plugin_name = module.path:ClassName'
    entry_points={
        'mkdocs.plugins': [
            'ai_plugin = mkdocs_plugins.ai_plugin:AIPlugin',
        ],
    },
    
    # External dependencies required by this plugin
    # These will be automatically installed when someone installs this plugin
    install_requires=[
        'mkdocs>=1.6.1',      # MkDocs base package
        'openai>=1.3.0',      # OpenAI API client for AI content generation
        'python-dotenv>=1.0.0', # For loading API keys from .env files
    ],
    
    # Uncomment and fill these in if you want to publish the plugin to PyPI
    # url="https://github.com/BA-CalderonMorales/my-life-as-a-dev",
    # classifiers=[
    #    "Programming Language :: Python :: 3",
    #    "License :: OSI Approved :: MIT License",
    #    "Operating System :: OS Independent",
    # ],
    # python_requires=">=3.8",
)