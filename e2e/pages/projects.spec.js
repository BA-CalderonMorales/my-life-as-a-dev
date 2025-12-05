const { pageOutputs, pageSources } = require('../config/pages');
const { assertFile, assertNoExposedMarkdown, readFileContents } = require('../shared/files');

function run() {
  const checks = [];
  checks.push(assertFile('Projects page source', pageSources.projects.source));
  const htmlCheck = readFileContents('Projects page output', pageOutputs.projects.output);
  checks.push(htmlCheck);
  checks.push(assertNoExposedMarkdown('Projects page hides Markdown syntax', htmlCheck.contents));
  return checks;
}

if (require.main === module) {
  const summary = run()
    .map((item) => `${item.label}: ${item.status}`)
    .join('\n');
  console.log(summary);
}

module.exports = { run };
