const mainConfig = require('../jest.config');

module.exports = {
  ...mainConfig,
  testRegex: '.*\\.e2e-spec\\.ts$',
  rootDir: '../',
};
