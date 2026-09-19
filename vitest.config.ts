import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    // Builds the test files with SWC so Nest's decorator metadata still works.
    swc.vite({ module: { type: 'es6' } }),
  ],
  test: {
    root: './',
    globals: true,
    environment: 'node',
    include: ['{src,test}/**/*.{spec,e2e-spec}.ts'],
    reporters: [
      'default',
      ['vitest-sonar-reporter', { outputFile: 'coverage/test-report.xml' }],
    ],
    coverage: {
      provider: 'v8',
      include: ['src/auth/**/*.ts'],
      exclude: ['src/auth/**/*.spec.ts', 'src/auth/**/*.e2e-spec.ts'],
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
});
