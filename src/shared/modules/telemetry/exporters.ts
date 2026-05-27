import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

import type { TelemetryEnv } from './env';

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
