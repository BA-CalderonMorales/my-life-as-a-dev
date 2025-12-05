const { pageSources } = require('../config/pages');
const { assertPathExists } = require('../shared/files');

function run() {
  const resolved = assertPathExists('Error page source', pageSources.error.source);
  return `Error page source located at ${resolved}`;
}

if (require.main === module) {
  console.log(run());
}

module.exports = { run };
