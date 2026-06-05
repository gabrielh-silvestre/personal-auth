import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const PRELOAD_PATH = path.join(
  REPO_ROOT,
  'dist',
  'shared',
  'modules',
  'telemetry',
  'instrumentation.js',
);

const runChild = (
  envOverrides: Record<string, string>,
  inlineCode: string,
  timeoutMs = 8_000,
): Promise<{ code: number | null; stdout: string; stderr: string }> =>
  new Promise((resolve) => {
    const child = spawn('node', ['-r', PRELOAD_PATH, '-e', inlineCode], {
      cwd: REPO_ROOT,
      env: { ...process.env, ...envOverrides },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (b) => {
      stdout += b.toString();
    });
    child.stderr.on('data', (b) => {
      stderr += b.toString();
    });
    const killer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('exit', (code) => {
      clearTimeout(killer);
      resolve({ code, stdout, stderr });
    });
  });

describe('telemetry preload e2e (boot-only)', () => {
  beforeAll(() => {
    if (!existsSync(PRELOAD_PATH)) {
      throw new Error(
        `Preload artifact missing at ${PRELOAD_PATH}. Run \`npm run build\` before \`npm run test:e2e\`.`,
      );
    }
  });

  it('OTEL_ENABLED=false: process boots with zero side effects and exits 0', async () => {
    const { code, stderr } = await runChild(
      { OTEL_ENABLED: 'false' },
      'console.log("BOOT_OK"); process.exit(0);',
    );

    expect(stderr).not.toContain('Error');
    expect(code).toBe(0);
  });

  it('OTEL_ENABLED=true: preload registers globals against an unreachable collector and exits 0', async () => {
    const { code, stdout, stderr } = await runChild(
      {
        OTEL_ENABLED: 'true',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:65535',
        OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: 'http://127.0.0.1:65535/v1/logs',
      },
      [
        'const api = require("@opentelemetry/api");',
        'const apiLogs = require("@opentelemetry/api-logs");',
        'const tp = api.trace.getTracerProvider().constructor.name;',
        'const lp = apiLogs.logs.getLoggerProvider().constructor.name;',
        'const mp = api.metrics.getMeterProvider().constructor.name;',
        'console.log(JSON.stringify({ tp, lp, mp }));',
        'setTimeout(() => process.exit(0), 500);',
      ].join(' '),
    );

    expect(stderr).not.toContain('UnhandledPromiseRejection');
    expect(code).toBe(0);

    const payload = JSON.parse(stdout.trim());
    expect(payload.tp).not.toMatch(/Noop/i);
    expect(payload.lp).not.toMatch(/Noop/i);
    expect(payload.mp).not.toMatch(/Noop/i);
  });
});
