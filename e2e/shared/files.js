const fs = require('fs');
const path = require('path');

function assertPathExists(label, targetPath) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} is missing at ${targetPath}`);
  }
  return path.resolve(targetPath);
}

function summarizeChecks(results) {
  const lines = results.map((entry) => `${entry.label}: ${entry.status}`);
  return lines.join('\n');
}

module.exports = { assertPathExists, summarizeChecks };
