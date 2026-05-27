import { DefaultConfig } from './constants';

export interface TelemetryEnv {
  OTEL_ENABLED: boolean;
  OTEL_SERVICE_NAME: string;
  OTEL_SERVICE_VERSION: string;
  OTEL_EXPORTER_OTLP_ENDPOINT: string;
  OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: string;
  OTEL_TRACES_SAMPLER: string;
  OTEL_TRACES_SAMPLER_ARG: string;
  OTEL_LOG_LEVEL: string;
  OTEL_METRIC_EXPORT_INTERVAL_MS: number;
  OTEL_RESOURCE_ATTRIBUTES: string;
  OTEL_NODE_DISABLED_INSTRUMENTATIONS: string[];
  NODE_ENV: string;
}

const truthy = (value: string | undefined): boolean =>
  value !== undefined && value.toLowerCase() === 'true';

const parseList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const parsePositiveInt = (
  value: string | undefined,
  fallback: number,
): number => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

export const loadTelemetryEnv = (
  source: NodeJS.ProcessEnv = process.env,
): TelemetryEnv => ({
  OTEL_ENABLED: truthy(source.OTEL_ENABLED),
  OTEL_SERVICE_NAME: source.OTEL_SERVICE_NAME ?? 'personal-auth',
  OTEL_SERVICE_VERSION: source.OTEL_SERVICE_VERSION ?? '0.0.0',
  OTEL_EXPORTER_OTLP_ENDPOINT:
    source.OTEL_EXPORTER_OTLP_ENDPOINT ?? DefaultConfig.OTLP_ENDPOINT,
  OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:
    source.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ?? DefaultConfig.OTLP_LOGS_ENDPOINT,
  OTEL_TRACES_SAMPLER: source.OTEL_TRACES_SAMPLER ?? DefaultConfig.SAMPLER,
  OTEL_TRACES_SAMPLER_ARG: source.OTEL_TRACES_SAMPLER_ARG ?? '',
  OTEL_LOG_LEVEL: source.OTEL_LOG_LEVEL ?? 'info',
  OTEL_METRIC_EXPORT_INTERVAL_MS: parsePositiveInt(
    source.OTEL_METRIC_EXPORT_INTERVAL_MS,
    DefaultConfig.METRIC_EXPORT_INTERVAL_MS,
  ),
  OTEL_RESOURCE_ATTRIBUTES: source.OTEL_RESOURCE_ATTRIBUTES ?? '',
  OTEL_NODE_DISABLED_INSTRUMENTATIONS: parseList(
    source.OTEL_NODE_DISABLED_INSTRUMENTATIONS,
  ),
  NODE_ENV: source.NODE_ENV ?? 'local',
});
