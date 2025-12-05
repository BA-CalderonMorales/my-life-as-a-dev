const path = require('path');
const { pageSources, docsRoot, siteRoot } = require('./config/pages');
const { assertDirectory, assertFile, summarizeChecks } = require('./shared/files');
const pageSpecs = [
  require('./pages/home.spec'),
  require('./pages/docsAsCode.spec'),
  require('./pages/learning.spec'),
  require('./pages/projects.spec'),
  require('./pages/resume.spec'),
  require('./pages/error.spec'),
];

function run() {
  const checks = [];
  const sharedPath = path.join(__dirname, 'shared');
  const pagesPath = path.join(__dirname, 'pages');
  const configPath = path.join(__dirname, 'config');
  checks.push(assertDirectory('Shared utilities directory', sharedPath));
  checks.push(assertDirectory('Page specs directory', pagesPath));
  checks.push(assertDirectory('Config directory', configPath));
  checks.push(assertFile('E2E README', path.join(__dirname, 'README.md')));
  checks.push(assertFile('Index spec', path.join(__dirname, 'index.spec.js')));
  Object.entries(pageSources).forEach(([key, value]) => {
    const pageLabel = `${value.name} source`;
    checks.push(assertFile(pageLabel, value.source));
    const specFile = path.join(pagesPath, `${key}.spec.js`);
    checks.push(assertFile(`${value.name} spec`, specFile));
  });
  const mappingFile = path.join(configPath, 'pages.js');
  checks.push(assertFile('Page mapping config', mappingFile));
  checks.push(assertDirectory('Docs root', docsRoot));
  checks.push(assertDirectory('Site root (mkdocs build output)', siteRoot));
  pageSpecs.forEach((spec) => {
    const specChecks = spec.run();
    checks.push(...specChecks);
  });
  return summarizeChecks(checks);
}

if (require.main === module) {
  console.log(run());
}

module.exports = { run };
