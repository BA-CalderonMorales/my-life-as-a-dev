const path = require('path');

const docsRoot = path.resolve(__dirname, '..', '..', 'docs');

const pageSources = {
  home: {
    name: 'Home',
    source: path.join(docsRoot, 'index.md'),
  },
  docsAsCode: {
    name: 'Docs as Code',
    source: path.join(docsRoot, 'docs-as-code', 'index.md'),
  },
  learning: {
    name: 'Learning',
    source: path.join(docsRoot, 'learning', 'index.md'),
  },
  projects: {
    name: 'Projects',
    source: path.join(docsRoot, 'projects', 'index.md'),
  },
  resume: {
    name: 'Resume',
    source: path.join(docsRoot, 'resume', 'index.md'),
  },
  error: {
    name: '404',
    source: path.join(docsRoot, '404.md'),
  },
};

const runtime = {
  baseUrl: process.env.DOCS_BASE_URL || 'http://localhost:8000',
};

module.exports = { pageSources, runtime, docsRoot };
