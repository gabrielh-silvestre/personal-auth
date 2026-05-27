import { loadTelemetryEnv } from '../env';
import { DefaultConfig } from '../constants';

describe('loadTelemetryEnv', () => {
  it('returns sane defaults when env is empty', () => {
    const env = loadTelemetryEnv({});

    expect(env.OTEL_ENABLED).toBe(false);
    expect(env.OTEL_SERVICE_NAME).toBe('personal-auth');
    expect(env.OTEL_SERVICE_VERSION).toBe('0.0.0');
    expect(env.OTEL_EXPORTER_OTLP_ENDPOINT).toBe(DefaultConfig.OTLP_ENDPOINT);
    expect(env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT).toBe(
      DefaultConfig.OTLP_LOGS_ENDPOINT,
    );
    expect(env.OTEL_TRACES_SAMPLER).toBe(DefaultConfig.SAMPLER);
    expect(env.OTEL_TRACES_SAMPLER_ARG).toBe('');
    expect(env.OTEL_LOG_LEVEL).toBe('info');
    expect(env.OTEL_METRIC_EXPORT_INTERVAL_MS).toBe(
      DefaultConfig.METRIC_EXPORT_INTERVAL_MS,
    );
    expect(env.OTEL_RESOURCE_ATTRIBUTES).toBe('');
    expect(env.OTEL_NODE_DISABLED_INSTRUMENTATIONS).toEqual([]);
    expect(env.NODE_ENV).toBe('local');
  });

  it('parses OTEL_ENABLED as boolean (case-insensitive truthy only)', () => {
    expect(loadTelemetryEnv({ OTEL_ENABLED: 'true' }).OTEL_ENABLED).toBe(true);
    expect(loadTelemetryEnv({ OTEL_ENABLED: 'TRUE' }).OTEL_ENABLED).toBe(true);
    expect(loadTelemetryEnv({ OTEL_ENABLED: 'false' }).OTEL_ENABLED).toBe(
      false,
    );
    expect(loadTelemetryEnv({ OTEL_ENABLED: '1' }).OTEL_ENABLED).toBe(false);
    expect(loadTelemetryEnv({ OTEL_ENABLED: '' }).OTEL_ENABLED).toBe(false);
  });

  it('parses comma-separated OTEL_NODE_DISABLED_INSTRUMENTATIONS, trimming entries', () => {
    const env = loadTelemetryEnv({
      OTEL_NODE_DISABLED_INSTRUMENTATIONS: ' fs, dns ,, net ',
    });
    expect(env.OTEL_NODE_DISABLED_INSTRUMENTATIONS).toEqual([
      'fs',
      'dns',
      'net',
    ]);
  });

  it('parses OTEL_METRIC_EXPORT_INTERVAL_MS as positive int, falling back on garbage', () => {
    expect(
      loadTelemetryEnv({ OTEL_METRIC_EXPORT_INTERVAL_MS: '1500' })
        .OTEL_METRIC_EXPORT_INTERVAL_MS,
    ).toBe(1500);
    expect(
      loadTelemetryEnv({ OTEL_METRIC_EXPORT_INTERVAL_MS: '0' })
        .OTEL_METRIC_EXPORT_INTERVAL_MS,
    ).toBe(DefaultConfig.METRIC_EXPORT_INTERVAL_MS);
    expect(
      loadTelemetryEnv({ OTEL_METRIC_EXPORT_INTERVAL_MS: '-50' })
        .OTEL_METRIC_EXPORT_INTERVAL_MS,
    ).toBe(DefaultConfig.METRIC_EXPORT_INTERVAL_MS);
    expect(
      loadTelemetryEnv({ OTEL_METRIC_EXPORT_INTERVAL_MS: 'notanumber' })
        .OTEL_METRIC_EXPORT_INTERVAL_MS,
    ).toBe(DefaultConfig.METRIC_EXPORT_INTERVAL_MS);
  });

  it('honors NODE_ENV and OTEL_RESOURCE_ATTRIBUTES overrides verbatim', () => {
    const env = loadTelemetryEnv({
      NODE_ENV: 'production',
      OTEL_RESOURCE_ATTRIBUTES: 'deployment.environment=production,team=auth',
    });
    expect(env.NODE_ENV).toBe('production');
    expect(env.OTEL_RESOURCE_ATTRIBUTES).toBe(
      'deployment.environment=production,team=auth',
    );
  });
});
