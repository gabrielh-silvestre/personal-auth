#!/usr/bin/env node
// Verifies that the permanent ESLint fixture under test/eslint-fixtures/
// fires both `no-restricted-imports` violations expected by the OTEL plan
// (one for @opentelemetry/* outside the telemetry module, one for direct
// imports of the preload entrypoint).
//
// Exits 0 when both violations are present, 1 otherwise.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Force legacy eslintrc until the project migrates to flat config.
process.env.ESLINT_USE_FLAT_CONFIG = 'false';
const { LegacyESLint } = await import('eslint/use-at-your-own-risk');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const fixturePath = path.join(
  repoRoot,
  'test/eslint-fixtures/telemetry-import-violation.fixture.ts',
);

const eslint = new LegacyESLint({
  cwd: repoRoot,
  ignore: false,
  useEslintrc: true,
});

const [report] = await eslint.lintFiles([fixturePath]);

if (!report) {
  console.error('[check-eslint-fixtures] no report for', fixturePath);
  process.exit(1);
}

const restricted = report.messages.filter(
  (m) => m.ruleId === 'no-restricted-imports',
);

const importStrings = restricted.map((m) => {
  const text = report.source ?? '';
  const lineStart =
    text.split('\n').slice(0, m.line - 1).join('\n').length + (m.line > 1 ? 1 : 0);
  return text.substr(lineStart, 120);
});

const sawOtel = restricted.some((m) =>
  /@opentelemetry\//.test(m.message) ||
    importStrings.some((s) => s.includes('@opentelemetry/api')),
);
const sawPreload = restricted.some(
  (m) =>
    /preload/i.test(m.message) ||
    /instrumentation/i.test(m.message) ||
    importStrings.some((s) => s.includes('telemetry/instrumentation')),
);

const formatter = await eslint.loadFormatter('stylish');
const text = await formatter.format([report]);

if (restricted.length < 2 || !sawOtel || !sawPreload) {
  console.error(
    '[check-eslint-fixtures] FAILED — expected both no-restricted-imports rule firings (@opentelemetry/* + telemetry/instrumentation).',
  );
  console.error(text);
  process.exit(1);
}

console.log(
  `[check-eslint-fixtures] OK — both expected violations fired (${restricted.length} total no-restricted-imports messages).`,
);
process.exit(0);
