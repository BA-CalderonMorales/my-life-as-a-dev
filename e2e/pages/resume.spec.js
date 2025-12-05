const { pageOutputs, pageSources } = require('../config/pages');
const { assertFile, assertNoExposedMarkdown, readFileContents } = require('../shared/files');

function run() {
  const checks = [];
  checks.push(assertFile('Resume page source', pageSources.resume.source));
  const htmlCheck = readFileContents('Resume page output', pageOutputs.resume.output);
  checks.push(htmlCheck);
  checks.push(assertNoExposedMarkdown('Resume page hides Markdown syntax', htmlCheck.contents));
  return checks;
}

if (require.main === module) {
  const summary = run()
    .map((item) => `${item.label}: ${item.status}`)
    .join('\n');
  console.log(summary);
}

module.exports = { run };
