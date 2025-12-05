const { pageSources } = require('../config/pages');
const { assertPathExists } = require('../shared/files');

function run() {
  const resolved = assertPathExists('Learning page source', pageSources.learning.source);
  return `Learning page source located at ${resolved}`;
}

if (require.main === module) {
  console.log(run());
}

module.exports = { run };
