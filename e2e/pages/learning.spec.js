const { pageOutputs, pageSources } = require('../config/pages');
const { assertFile, assertNoExposedMarkdown, readFileContents } = require('../shared/files');

function run() {
  const checks = [];
  checks.push(assertFile('Learning page source', pageSources.learning.source));
  const htmlCheck = readFileContents('Learning page output', pageOutputs.learning.output);
  checks.push(htmlCheck);
  checks.push(assertNoExposedMarkdown('Learning page hides Markdown syntax', htmlCheck.contents));
  return checks;
}

if (require.main === module) {
  const summary = run()
    .map((item) => `${item.label}: ${item.status}`)
    .join('\n');
  console.log(summary);
}

module.exports = { run };
