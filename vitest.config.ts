import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // Builds the test files with SWC so Nest's decorator metadata still works.
    swc.vite({ module: { type: 'es6' } }),
  ],
  resolve: {
    // Picks the "development" branch of package.json #subpath imports,
    // so #auth/*, #shared/*, #exceptions/*, #app/* resolve to src/**/*.ts
    // instead of the compiled dist/**/*.js.
    conditions: ['development'],
  },
  test: {
    root: './',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    reporters: [
      'default',
      ['vitest-sonar-reporter', { outputFile: 'coverage/test-report.xml' }],
    ],
    coverage: {
      provider: 'v8',
      include: ['src/auth/**/*.ts'],
      exclude: ['src/auth/**/*.spec.ts'],
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
});
