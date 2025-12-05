const { pageSources } = require('../config/pages');
const { assertPathExists } = require('../shared/files');

function run() {
  const resolved = assertPathExists('Projects page source', pageSources.projects.source);
  return `Projects page source located at ${resolved}`;
}

if (require.main === module) {
  console.log(run());
}

module.exports = { run };
