const mainConfig = require('../jest.config');

module.exports = {
  ...mainConfig,
  testRegex: '.*/(test|src)/.*/*.(spec|e2e-spec).ts$',
  rootDir: '../',
};
