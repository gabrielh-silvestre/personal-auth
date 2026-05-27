// Preload entrypoint for OpenTelemetry. Loaded via
//   node -r ./dist/src/shared/modules/telemetry/instrumentation.js dist/src/main
// Never imported as a module (the ESLint rule in .eslintrc.js enforces this).
//
// Lazy-require discipline: the only thing that may execute before the
// OTEL_ENABLED check is the env reader. Every @opentelemetry/* module
// load happens inside runPreload(), which is only invoked when the
// env flag is true. This guarantees the disabled path pays zero parse
// cost and no instrumentation hooks ever attach.

import { loadTelemetryEnv, type TelemetryEnv } from './env';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const withTimeout = async <T>(work: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    work,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`telemetry shutdown exceeded ${ms}ms`)),
        ms,
      ),
    ),
  ]);

export const runPreload = (env: TelemetryEnv): void => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const {
    context,
    metrics,
    propagation,
    trace,
  } = require('@opentelemetry/api');
  const { logs } = require('@opentelemetry/api-logs');
  const {
    registerInstrumentations,
  } = require('@opentelemetry/instrumentation');

  const {
    enableAsyncLocalStorageContextManager,
  } = require('./context-manager');
  const { buildAutoInstrumentations } = require('./auto-instrumentations');
  const { buildCompositePropagator } = require('./propagator');
  const {
    buildLoggerProvider,
    buildMeterProvider,
    buildTracerProvider,
  } = require('./providers');
  const { setTelemetryShutdown } = require('./shutdown');
  /* eslint-enable @typescript-eslint/no-require-imports */

  // Globals are registered in a strict order so any third-party caller
  // that asks for a tracer/logger/meter immediately after preload sees
  // the configured providers, not the API package's no-op fallbacks.
  enableAsyncLocalStorageContextManager();
  propagation.setGlobalPropagator(buildCompositePropagator());

  const tracerProvider = buildTracerProvider(env);
  trace.setGlobalTracerProvider(tracerProvider);

  const loggerProvider = buildLoggerProvider(env);
  logs.setGlobalLoggerProvider(loggerProvider);

  const meterProvider = buildMeterProvider(env);
  metrics.setGlobalMeterProvider(meterProvider);

  registerInstrumentations({
    instrumentations: buildAutoInstrumentations(env),
  });

  // Stash a shutdown handle that the Nest lifecycle hook (Step 6)
  // invokes from beforeApplicationShutdown so OTel teardown runs AFTER
  // HTTP/gRPC handlers have drained and the RMQ consumer has stopped.
  setTelemetryShutdown(async () => {
    try {
      await withTimeout(
        Promise.all([
          tracerProvider.shutdown(),
          loggerProvider.shutdown(),
          meterProvider.shutdown(),
        ]),
        SHUTDOWN_TIMEOUT_MS,
      );
    } catch (error) {
      // Intentional: swallow the timeout so SIGTERM is never blocked.
      // eslint-disable-next-line no-console
      console.error('[telemetry] shutdown error:', error);
    }
  });

  // Touch context so the manager is initialized eagerly — surfaces any
  // wiring bug at boot rather than on the first request.
  context.active();
};

const env = loadTelemetryEnv(process.env);

if (env.OTEL_ENABLED) {
  runPreload(env);
}
