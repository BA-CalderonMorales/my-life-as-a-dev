#!/bin/bash

echo "=== Installing required Python packages ==="
pip install mkdocs-material mkdocs-awesome-nav mkdocs-git-authors-plugin mkdocs-git-revision-date-localized-plugin mkdocs-minify-plugin mkdocs-panzoom-plugin mike

echo "=== Building the site ==="
mkdocs build

echo "=== Starting the development server ==="
echo "Visit http://localhost:8000 to see your site"
echo "Press Ctrl+C to stop the server"
mkdocs serve
