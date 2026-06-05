import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

import type { TelemetryEnv } from './env';

// Transport contract: traces + metrics use OTLP/gRPC on port 4317;
// logs use OTLP/HTTP on port 4318. Reusing OTEL_EXPORTER_OTLP_ENDPOINT
// across signals is intentional but assumes the collector exposes both
// ports on the same host. If signals must point to different collectors,
// use OTEL_EXPORTER_OTLP_LOGS_ENDPOINT (already split) and consider
// adding OTEL_EXPORTER_OTLP_TRACES_ENDPOINT/_METRICS_ENDPOINT.

export const buildTraceExporter = (
  env: Pick<TelemetryEnv, 'OTEL_EXPORTER_OTLP_ENDPOINT'>,
): OTLPTraceExporter =>
  new OTLPTraceExporter({ url: env.OTEL_EXPORTER_OTLP_ENDPOINT });

export const buildMetricExporter = (
  env: Pick<TelemetryEnv, 'OTEL_EXPORTER_OTLP_ENDPOINT'>,
): OTLPMetricExporter =>
  new OTLPMetricExporter({ url: env.OTEL_EXPORTER_OTLP_ENDPOINT });

export const buildLogExporter = (
  env: Pick<TelemetryEnv, 'OTEL_EXPORTER_OTLP_LOGS_ENDPOINT'>,
): OTLPLogExporter =>
  new OTLPLogExporter({ url: env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT });
