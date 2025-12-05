const { pageOutputs, pageSources } = require('../config/pages');
const { assertFile, assertNoExposedMarkdown, readFileContents } = require('../shared/files');

function run() {
  const checks = [];
  checks.push(assertFile('Error page source', pageSources.error.source));
  const htmlCheck = readFileContents('Error page output', pageOutputs.error.output);
  checks.push(htmlCheck);
  checks.push(assertNoExposedMarkdown('Error page hides Markdown syntax', htmlCheck.contents));
  return checks;
}

if (require.main === module) {
  const summary = run()
    .map((item) => `${item.label}: ${item.status}`)
    .join('\n');
  console.log(summary);
}

module.exports = { run };
