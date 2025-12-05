const { pageSources } = require('../config/pages');
const { assertPathExists } = require('../shared/files');

function run() {
  const resolved = assertPathExists('Resume page source', pageSources.resume.source);
  return `Resume page source located at ${resolved}`;
}

if (require.main === module) {
  console.log(run());
}

module.exports = { run };
