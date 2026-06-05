import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';

import { buildSampler } from '../sampler';

const makeEnv = (
  sampler: string,
  arg = '',
): { OTEL_TRACES_SAMPLER: string; OTEL_TRACES_SAMPLER_ARG: string } => ({
  OTEL_TRACES_SAMPLER: sampler,
  OTEL_TRACES_SAMPLER_ARG: arg,
});

describe('buildSampler', () => {
  it('defaults to parentbased_always_on when the env value is unknown', () => {
    expect(buildSampler(makeEnv('not_a_sampler'))).toBeInstanceOf(
      ParentBasedSampler,
    );
  });

  it('returns AlwaysOnSampler for always_on', () => {
    expect(buildSampler(makeEnv('always_on'))).toBeInstanceOf(AlwaysOnSampler);
  });

  it('returns AlwaysOffSampler for always_off', () => {
    expect(buildSampler(makeEnv('always_off'))).toBeInstanceOf(
      AlwaysOffSampler,
    );
  });

  it('returns a TraceIdRatioBasedSampler when sampler=traceidratio with a valid arg', () => {
    expect(buildSampler(makeEnv('traceidratio', '0.25'))).toBeInstanceOf(
      TraceIdRatioBasedSampler,
    );
  });

  it('falls back to ratio=1 when traceidratio arg is invalid', () => {
    expect(buildSampler(makeEnv('traceidratio', 'oops'))).toBeInstanceOf(
      TraceIdRatioBasedSampler,
    );
    expect(buildSampler(makeEnv('traceidratio', '-1'))).toBeInstanceOf(
      TraceIdRatioBasedSampler,
    );
    expect(buildSampler(makeEnv('traceidratio', '2'))).toBeInstanceOf(
      TraceIdRatioBasedSampler,
    );
  });

  it('returns ParentBasedSampler for the parent-based variants', () => {
    expect(buildSampler(makeEnv('parentbased_always_on'))).toBeInstanceOf(
      ParentBasedSampler,
    );
    expect(buildSampler(makeEnv('parentbased_always_off'))).toBeInstanceOf(
      ParentBasedSampler,
    );
    expect(
      buildSampler(makeEnv('parentbased_traceidratio', '0.5')),
    ).toBeInstanceOf(ParentBasedSampler);
  });

  it('matches the sampler name case-insensitively', () => {
    expect(buildSampler(makeEnv('ALWAYS_ON'))).toBeInstanceOf(AlwaysOnSampler);
  });
});
