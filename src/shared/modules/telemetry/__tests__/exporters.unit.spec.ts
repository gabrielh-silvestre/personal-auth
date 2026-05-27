import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

import { loadTelemetryEnv } from '../env';
import {
  buildLogExporter,
  buildMetricExporter,
  buildTraceExporter,
} from '../exporters';

describe('exporters', () => {
  const env = loadTelemetryEnv({
    OTEL_EXPORTER_OTLP_ENDPOINT: 'http://collector:4317',
    OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: 'http://collector:4318/v1/logs',
  });

  it('builds an OTLP trace exporter wired to the configured endpoint', () => {
    const exporter = buildTraceExporter(env);
    expect(exporter).toBeInstanceOf(OTLPTraceExporter);
  });

  it('builds an OTLP metric exporter wired to the configured endpoint', () => {
    const exporter = buildMetricExporter(env);
    expect(exporter).toBeInstanceOf(OTLPMetricExporter);
  });

  it('builds an OTLP log exporter wired to the configured logs endpoint', () => {
    const exporter = buildLogExporter(env);
    expect(exporter).toBeInstanceOf(OTLPLogExporter);
  });
});
