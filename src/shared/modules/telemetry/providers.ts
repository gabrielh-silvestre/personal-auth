import {
  BatchLogRecordProcessor,
  LoggerProvider,
  SimpleLogRecordProcessor,
  type LogRecordExporter,
} from '@opentelemetry/sdk-logs';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  type MetricReader,
  type PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  type SpanExporter,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import type { TelemetryEnv } from './env';
import {
  buildLogExporter,
  buildMetricExporter,
  buildTraceExporter,
} from './exporters';
import { buildResource } from './resource';
import { buildSampler } from './sampler';

export interface ProviderOverrides {
  spanExporter?: SpanExporter;
  logRecordExporter?: LogRecordExporter;
  metricExporter?: PushMetricExporter;
}

const isDebugLogLevel = (level: string): boolean =>
  level.toLowerCase() === 'debug';

export const buildSpanProcessors = (
  env: TelemetryEnv,
  override?: SpanExporter,
): SpanProcessor[] => {
  const exporter = override ?? buildTraceExporter(env);
  const processors: SpanProcessor[] = [new BatchSpanProcessor(exporter)];
  if (isDebugLogLevel(env.OTEL_LOG_LEVEL)) {
    processors.push(new BatchSpanProcessor(new ConsoleSpanExporter()));
  }
  return processors;
};

export const buildTracerProvider = (
  env: TelemetryEnv,
  overrides: ProviderOverrides = {},
): NodeTracerProvider =>
  new NodeTracerProvider({
    resource: buildResource(env),
    sampler: buildSampler(env),
    spanProcessors: buildSpanProcessors(env, overrides.spanExporter),
  });

export const buildLoggerProvider = (
  env: TelemetryEnv,
  overrides: ProviderOverrides = {},
): LoggerProvider => {
  const exporter = overrides.logRecordExporter ?? buildLogExporter(env);
  const processor = overrides.logRecordExporter
    ? new SimpleLogRecordProcessor(exporter)
    : new BatchLogRecordProcessor(exporter);
  return new LoggerProvider({
    resource: buildResource(env),
    processors: [processor],
  });
};

export const buildMeterProvider = (
  env: TelemetryEnv,
  overrides: ProviderOverrides = {},
): MeterProvider => {
  const exporter = overrides.metricExporter ?? buildMetricExporter(env);
  const reader: MetricReader = new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: env.OTEL_METRIC_EXPORT_INTERVAL_MS,
  });
  return new MeterProvider({
    resource: buildResource(env),
    readers: [reader],
  });
};
