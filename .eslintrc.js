module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'test/eslint-fixtures/**'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'test/**/*.ts'],
      excludedFiles: ['src/shared/modules/telemetry/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@opentelemetry/*'],
                message:
                  'Import @opentelemetry only inside src/shared/modules/telemetry/.',
              },
              {
                group: [
                  '**/shared/modules/telemetry/instrumentation',
                  '@shared/modules/telemetry/instrumentation',
                ],
                message:
                  'The preload must not be imported. Load it with `node -r` only.',
              },
            ],
          },
        ],
      },
    },
  ],
};
