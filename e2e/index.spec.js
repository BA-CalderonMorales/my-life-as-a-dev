const fs = require('fs');
const path = require('path');
const { pageSources, docsRoot } = require('./config/pages');
const { summarizeChecks } = require('./shared/files');

function assertDirectory(label, targetPath) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} is missing at ${targetPath}`);
  }
  if (!fs.statSync(targetPath).isDirectory()) {
    throw new Error(`${label} is not a directory at ${targetPath}`);
  }
  return { label, status: 'ok' };
}

function assertFile(label, targetPath) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} is missing at ${targetPath}`);
  }
  if (!fs.statSync(targetPath).isFile()) {
    throw new Error(`${label} is not a file at ${targetPath}`);
  }
  return { label, status: 'ok' };
}

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
  const docsRootCheck = assertDirectory('Docs root', docsRoot);
  checks.push(docsRootCheck);
  return summarizeChecks(checks);
}

if (require.main === module) {
  console.log(run());
}

module.exports = { run };
