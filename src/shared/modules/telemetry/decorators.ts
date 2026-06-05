import { getCounterPair } from './metrics';

/**
 * Selector invoked once per call to attach attributes to the counter.
 *
 * IMPORTANT: attributes MUST be low-cardinality enumerables (status codes,
 * token types, boolean flags). Never derive labels from user data (userId,
 * email, IP), free-form strings, or anything unbounded — each unique label
 * combination becomes a separate metric series and will exhaust the backend.
 *
 * The third argument `error` is populated on the failure path (when the
 * decorated method throws); `result` is `undefined` in that case.
 */
export interface CounterDecoratorOptions {
  attributes?: (
    args: unknown[],
    result: unknown,
    error?: unknown,
  ) => Record<string, string | number | boolean>;
}

const safeAttributes = (
  opts: CounterDecoratorOptions | undefined,
  args: unknown[],
  result: unknown,
  error?: unknown,
): Record<string, string | number | boolean> | undefined => {
  if (!opts?.attributes) return undefined;
  try {
    return opts.attributes(args, result, error);
  } catch {
    // Swallow selector errors so they never mask the original error
    // or corrupt the counter increment path.
    return undefined;
  }
};

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  !!value &&
  (typeof value === 'object' || typeof value === 'function') &&
  typeof (value as { then?: unknown }).then === 'function';

const counterDecorator =
  (
    meterName: string,
    metricName: string,
    opts?: CounterDecoratorOptions,
  ): MethodDecorator =>
  (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      const counters = getCounterPair(meterName, metricName);
      let result: unknown;
      try {
        result = original.apply(this, args);
      } catch (error) {
        counters.fail.add(1, safeAttributes(opts, args, undefined, error));
        throw error;
      }
      if (!isThenable(result)) {
        counters.success.add(1, safeAttributes(opts, args, result));
        return result;
      }
      return Promise.resolve(result).then(
        (resolved) => {
          counters.success.add(1, safeAttributes(opts, args, resolved));
          return resolved;
        },
        (error) => {
          counters.fail.add(1, safeAttributes(opts, args, undefined, error));
          throw error;
        },
      );
    };
    return descriptor;
  };

export const Metrics = {
  Counter: counterDecorator,
};
