import { getCounterPair } from './metrics';

export interface CounterDecoratorOptions {
  /** Selector invoked once per call to attach attributes to the counter. */
  attributes?: (
    args: unknown[],
    result: unknown,
  ) => Record<string, string | number | boolean>;
}

const counterDecorator =
  (
    meterName: string,
    metricName: string,
    opts?: CounterDecoratorOptions,
  ): MethodDecorator =>
  (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const counters = getCounterPair(meterName, metricName);
      try {
        const result = await original.apply(this, args);
        const attrs = opts?.attributes?.(args, result);
        counters.success.add(1, attrs);
        return result;
      } catch (error) {
        const attrs = opts?.attributes?.(args, undefined);
        counters.fail.add(1, attrs);
        throw error;
      }
    };
    return descriptor;
  };

export const Metrics = {
  Counter: counterDecorator,
};
