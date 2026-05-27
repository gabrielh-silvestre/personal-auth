import { diag } from '@opentelemetry/api';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  Sampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';

import type { TelemetryEnv } from './env';

const KNOWN_SAMPLERS = new Set([
  'always_on',
  'always_off',
  'traceidratio',
  'parentbased_always_on',
  'parentbased_always_off',
  'parentbased_traceidratio',
]);

const parseRatio = (raw: string): number | undefined => {
  if (raw === '') return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) return undefined;
  return parsed;
};

export const buildSampler = (
  env: Pick<TelemetryEnv, 'OTEL_TRACES_SAMPLER' | 'OTEL_TRACES_SAMPLER_ARG'>,
): Sampler => {
  const name = env.OTEL_TRACES_SAMPLER.toLowerCase();
  if (!KNOWN_SAMPLERS.has(name)) {
    diag.warn(
      `[telemetry] Unknown OTEL_TRACES_SAMPLER="${env.OTEL_TRACES_SAMPLER}"; falling back to parentbased_always_on.`,
    );
  }
  switch (name) {
    case 'always_on':
      return new AlwaysOnSampler();
    case 'always_off':
      return new AlwaysOffSampler();
    case 'traceidratio': {
      const ratio = parseRatio(env.OTEL_TRACES_SAMPLER_ARG);
      return new TraceIdRatioBasedSampler(ratio ?? 1);
    }
    case 'parentbased_always_off':
      return new ParentBasedSampler({ root: new AlwaysOffSampler() });
    case 'parentbased_traceidratio': {
      const ratio = parseRatio(env.OTEL_TRACES_SAMPLER_ARG);
      return new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(ratio ?? 1),
      });
    }
    case 'parentbased_always_on':
      return new ParentBasedSampler({ root: new AlwaysOnSampler() });
    default:
      return new ParentBasedSampler({ root: new AlwaysOnSampler() });
  }
};
