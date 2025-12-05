const { pageOutputs, pageSources } = require('../config/pages');
const {
  assertFile,
  assertHtmlContains,
  assertNoExposedMarkdown,
  readFileContents,
} = require('../shared/files');

function run() {
  const checks = [];
  checks.push(assertFile('Home page source', pageSources.home.source));
  const htmlCheck = readFileContents('Home page output', pageOutputs.home.output);
  checks.push(htmlCheck);
  checks.push(
    assertHtmlContains('Home hero renders with emphasis', htmlCheck.contents, '<strong>I build developer tooling'),
  );
  checks.push(assertNoExposedMarkdown('Home page hides Markdown syntax', htmlCheck.contents));
  return checks;
}

if (require.main === module) {
  const summary = run()
    .map((item) => `${item.label}: ${item.status}`)
    .join('\n');
  console.log(summary);
}

module.exports = { run };
