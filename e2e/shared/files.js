const fs = require('fs');
const path = require('path');

function assertDirectory(label, targetPath) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} is missing at ${targetPath}`);
  }
  if (!fs.statSync(targetPath).isDirectory()) {
    throw new Error(`${label} is not a directory at ${targetPath}`);
  }
  return { label, status: 'ok', path: path.resolve(targetPath) };
}

function assertFile(label, targetPath) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} is missing at ${targetPath}`);
  }
  if (!fs.statSync(targetPath).isFile()) {
    throw new Error(`${label} is not a file at ${targetPath}`);
  }
  return { label, status: 'ok', path: path.resolve(targetPath) };
}

function readFileContents(label, targetPath) {
  const check = assertFile(label, targetPath);
  const contents = fs.readFileSync(check.path, 'utf8');
  return { ...check, contents };
}

function assertHtmlContains(label, html, snippet) {
  if (!html.includes(snippet)) {
    throw new Error(`${label} is missing expected snippet: ${snippet}`);
  }
  return { label, status: 'ok' };
}

function assertNoExposedMarkdown(label, html, tokens = ['**']) {
  const sanitized = html.replace(/<code[\s\S]*?<\/code>/g, '');
  const exposed = tokens.find((token) => sanitized.includes(token));
  if (exposed) {
    throw new Error(`${label} reveals raw Markdown token: ${exposed}`);
  }
  return { label, status: 'ok' };
}

function summarizeChecks(results) {
  const lines = results.map((entry) => `${entry.label}: ${entry.status}`);
  return lines.join('\n');
}

module.exports = {
  assertDirectory,
  assertFile,
  assertHtmlContains,
  assertNoExposedMarkdown,
  readFileContents,
  summarizeChecks,
};
