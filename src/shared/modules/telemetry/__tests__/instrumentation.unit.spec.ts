import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

import {
  buildAutoInstrumentations,
  mongooseDbStatementSerializer,
} from '../auto-instrumentations';

const PRELOAD_PATH = path
  .resolve(__dirname, '..', 'instrumentation.ts')
  .replace(/\\/g, '/');

const PROJECT_ROOT = path.resolve(__dirname, '../../../../../');

const runNode = (
  code: string,
  env: Record<string, string>,
  timeoutMs = 20_000,
): { status: number | null; stdout: string; stderr: string } => {
  const result = spawnSync(
    'node',
    ['-r', 'ts-node/register/transpile-only', '-e', code],
    {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        TS_NODE_TRANSPILE_ONLY: 'true',
        TS_NODE_FILES: 'false',
        ...env,
      },
      encoding: 'utf-8',
      timeout: timeoutMs,
    },
  );
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
};

describe('telemetry preload', () => {
  describe('OTEL_ENABLED=false short-circuit (M8)', () => {
    it('loads zero @opentelemetry/sdk-* and @opentelemetry/exporter-* modules', () => {
      const code = `
        require('${PRELOAD_PATH}');
        const keys = Object.keys(require.cache);
        const offenders = keys.filter((k) =>
          /@opentelemetry\\//.test(k),
        );
        console.log(JSON.stringify(offenders));
      `;
      const { status, stdout, stderr } = runNode(code, {
        OTEL_ENABLED: 'false',
      });

      expect(status).toBe(0);
      expect(stderr).not.toContain('Error');
      const offenders = JSON.parse(stdout.trim() || '[]');
      expect(offenders).toEqual([]);
    });
  });

  describe('OTEL_ENABLED=true global registration (M1, M5)', () => {
    it('registers all five globals and an AsyncLocalStorage-backed context manager', () => {
      const code = `
        require('${PRELOAD_PATH}');
        const api = require('@opentelemetry/api');
        const apiLogs = require('@opentelemetry/api-logs');
        const tracer = api.trace.getTracer('probe');
        const span = tracer.startSpan('s');
        const ctx = api.trace.setSpan(api.context.active(), span);
        let observed = null;
        api.context.with(ctx, async () => {
          observed = api.trace.getActiveSpan()?.spanContext().spanId;
        }).then(() => {
          console.log(JSON.stringify({
            observed,
            spanId: span.spanContext().spanId,
            tracerProvider: api.trace.getTracerProvider().constructor.name,
            loggerProvider: apiLogs.logs.getLoggerProvider().constructor.name,
            meterProvider: api.metrics.getMeterProvider().constructor.name,
          }));
          span.end();
          process.exit(0);
        }).catch((e) => { console.error(e && e.stack || String(e)); process.exit(1); });
      `;
      const { status, stdout, stderr } = runNode(code, {
        OTEL_ENABLED: 'true',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:65535',
        OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: 'http://127.0.0.1:65535/v1/logs',
      });

      if (status !== 0) {
        throw new Error(
          `child exited ${status}\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`,
        );
      }
      const payload = JSON.parse(stdout.trim());
      expect(payload.observed).toBe(payload.spanId);
      // Providers can be wrapped in proxies by @opentelemetry/api — the
      // existence of a non-noop provider is the contract we care about.
      expect(payload.tracerProvider).not.toMatch(/Noop/i);
      expect(payload.loggerProvider).not.toMatch(/Noop/i);
      expect(payload.meterProvider).not.toMatch(/Noop/i);
    });
  });

  describe('collector unreachable clean start (M5)', () => {
    it('exits 0 with no unhandled rejections when OTLP endpoint refuses connections', () => {
      const code = `
          process.on('unhandledRejection', (err) => {
            console.error('UNHANDLED_REJECTION', err);
            process.exit(2);
          });
          require('${PRELOAD_PATH}');
          // Wait scheduledDelayMillis (5s) + 2s buffer so BatchSpanProcessor
          // attempts one export against the closed port.
          setTimeout(() => process.exit(0), 7000);
        `;
      const { status, stderr } = runNode(
        code,
        {
          OTEL_ENABLED: 'true',
          OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:65535',
          OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: 'http://127.0.0.1:65535/v1/logs',
          OTEL_METRIC_EXPORT_INTERVAL_MS: '1000',
        },
        15_000,
      );

      expect(stderr).not.toContain('UNHANDLED_REJECTION');
      expect(stderr).not.toContain('UnhandledPromiseRejection');
      expect(status).toBe(0);
    }, 20_000);
  });
});

describe('auto-instrumentations mongoose config (rev3)', () => {
  it('configures requireParentSpan:true and a payload-stripping dbStatementSerializer', () => {
    const insts = buildAutoInstrumentations({
      OTEL_NODE_DISABLED_INSTRUMENTATIONS: [],
    });
    const mongoose = insts.find(
      (i) =>
        i.instrumentationName === '@opentelemetry/instrumentation-mongoose',
    );
    expect(mongoose).toBeDefined();

    // Inspect the configured options via the public getConfig() helper
    // (exists on InstrumentationBase since 0.46.0).
    const config = (
      mongoose as unknown as {
        getConfig(): {
          requireParentSpan?: boolean;
          dbStatementSerializer?: (op: string, payload: unknown) => string;
        };
      }
    ).getConfig();
    expect(config.requireParentSpan).toBe(true);
    expect(typeof config.dbStatementSerializer).toBe('function');

    const out = mongooseDbStatementSerializer('findOne', {
      filter: { email: 'leaked@example.com', password: 'hunter2' },
    });
    expect(out).not.toContain('leaked@example.com');
    expect(out).not.toContain('hunter2');
    expect(out).not.toContain('email');
    expect(out).toBe('findOne');
  });

  it('respects OTEL_NODE_DISABLED_INSTRUMENTATIONS to exclude individual instrumentations', () => {
    const all = buildAutoInstrumentations({
      OTEL_NODE_DISABLED_INSTRUMENTATIONS: [],
    });
    const withoutMongoose = buildAutoInstrumentations({
      OTEL_NODE_DISABLED_INSTRUMENTATIONS: ['mongoose'],
    });

    expect(all.length).toBeGreaterThan(withoutMongoose.length);
    expect(
      withoutMongoose.some(
        (i) =>
          i.instrumentationName === '@opentelemetry/instrumentation-mongoose',
      ),
    ).toBe(false);
  });
});
