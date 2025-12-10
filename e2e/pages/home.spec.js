const { pageSources } = require('../config/pages');
const { assertPathExists } = require('../shared/files');

function run() {
  const resolved = assertPathExists('Home page source', pageSources.home.source);
  return `Home page source located at ${resolved}`;
}

if (require.main === module) {
  console.log(run());
}

module.exports = { run };
