const path = require('path');

const docsRoot = path.resolve(__dirname, '..', '..', 'docs');
const siteRoot = path.resolve(__dirname, '..', '..', 'site');

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

const pageOutputs = {
  home: {
    name: 'Home',
    output: path.join(siteRoot, 'index.html'),
  },
  docsAsCode: {
    name: 'Docs as Code',
    output: path.join(siteRoot, 'docs-as-code', 'index.html'),
  },
  learning: {
    name: 'Learning',
    output: path.join(siteRoot, 'learning', 'index.html'),
  },
  projects: {
    name: 'Projects',
    output: path.join(siteRoot, 'projects', 'index.html'),
  },
  resume: {
    name: 'Resume',
    output: path.join(siteRoot, 'resume', 'index.html'),
  },
  error: {
    name: '404',
    output: path.join(siteRoot, '404.html'),
  },
};

const runtime = {
  baseUrl: process.env.DOCS_BASE_URL || 'http://localhost:8000',
};

module.exports = { pageSources, pageOutputs, runtime, docsRoot, siteRoot };
