// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  testRunner_comment:
    'More information about the jest plugin can be found here: https://stryker-mutator.io/docs/stryker-js/jest-runner',
  coverageAnalysis: 'perTest',
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  mutate: [
    '{src/**/domain/**/*.ts,src/**/useCase/**/*.ts}',
    '!{src/**/domain/**/*.{spec,test}.ts,src/**/useCase/**/*.{spec,test}.ts}',
  ],
};
export default config;
