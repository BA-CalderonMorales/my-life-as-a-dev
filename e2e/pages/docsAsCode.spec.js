const { pageOutputs, pageSources } = require('../config/pages');
const { assertFile, assertNoExposedMarkdown, readFileContents } = require('../shared/files');

function run() {
  const checks = [];
  checks.push(assertFile('Docs as Code page source', pageSources.docsAsCode.source));
  const htmlCheck = readFileContents('Docs as Code page output', pageOutputs.docsAsCode.output);
  checks.push(htmlCheck);
  checks.push(assertNoExposedMarkdown('Docs as Code page hides Markdown syntax', htmlCheck.contents));
  return checks;
}

if (require.main === module) {
  const summary = run()
    .map((item) => `${item.label}: ${item.status}`)
    .join('\n');
  console.log(summary);
}

module.exports = { run };
