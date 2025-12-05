const { pageSources } = require('../config/pages');
const { assertPathExists } = require('../shared/files');

function run() {
  const resolved = assertPathExists('Docs as Code source', pageSources.docsAsCode.source);
  return `Docs as Code source located at ${resolved}`;
}

if (require.main === module) {
  console.log(run());
}

module.exports = { run };
