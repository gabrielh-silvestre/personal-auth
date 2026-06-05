import { metrics, type Counter } from '@opentelemetry/api';

interface CounterPair {
  success: Counter;
  fail: Counter;
}

const cache = new Map<string, CounterPair>();

export const resetMetricsCache = (): void => {
  cache.clear();
};

export const getCounterPair = (
  meterName: string,
  metricName: string,
): CounterPair => {
  const key = `${meterName}::${metricName}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const meter = metrics.getMeter(meterName);
  const pair: CounterPair = {
    success: meter.createCounter(`${metricName}.success`),
    fail: meter.createCounter(`${metricName}.fail`),
  };
  cache.set(key, pair);
  return pair;
};
