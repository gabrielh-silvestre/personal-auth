import { metrics } from '@opentelemetry/api';

import { Metrics } from '../decorators';
import { resetMetricsCache } from '../metrics';

interface MockCounter {
  add: jest.Mock;
}

interface MockMeter {
  createCounter: jest.Mock<MockCounter, [string]>;
}

describe('@Metrics.Counter', () => {
  let counters: Record<string, MockCounter>;
  let mockMeter: MockMeter;

  beforeEach(() => {
    resetMetricsCache();
    counters = {};
    mockMeter = {
      createCounter: jest.fn((name: string) => {
        const counter: MockCounter = { add: jest.fn() };
        counters[name] = counter;
        return counter;
      }),
    };
    jest
      .spyOn(metrics, 'getMeter')
      .mockReturnValue(
        mockMeter as unknown as ReturnType<typeof metrics.getMeter>,
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  class Sample {
    @Metrics.Counter('test.meter', 'test.metric')
    async ok() {
      return 'ok';
    }

    @Metrics.Counter('test.meter', 'test.metric')
    async boom() {
      throw new Error('boom');
    }

    @Metrics.Counter('test.meter', 'test.metric.attrs', {
      attributes: (args) => ({ argCount: args.length }),
    })
    async withAttrs(): Promise<number> {
      return 1;
    }
  }

  it('increments the success counter when the method resolves', async () => {
    await new Sample().ok();
    expect(counters['test.metric.success'].add).toHaveBeenCalledWith(
      1,
      undefined,
    );
    expect(counters['test.metric.fail'].add).not.toHaveBeenCalled();
  });

  it('increments the fail counter on rejection and rethrows', async () => {
    await expect(new Sample().boom()).rejects.toThrow('boom');
    expect(counters['test.metric.fail'].add).toHaveBeenCalledWith(1, undefined);
    expect(counters['test.metric.success'].add).not.toHaveBeenCalled();
  });

  it('invokes the attributes() selector exactly once per call', async () => {
    const selector = jest.fn().mockReturnValue({ tag: 'ok' });
    class Local {
      @Metrics.Counter('m', 'x', { attributes: selector })
      async go() {
        return 'yes';
      }
    }
    await new Local().go();
    expect(selector).toHaveBeenCalledTimes(1);
  });

  it('passes the attributes selector result to counter.add', async () => {
    await (new Sample().withAttrs as (...args: unknown[]) => Promise<number>)(
      'hello',
    );
    expect(counters['test.metric.attrs.success'].add).toHaveBeenCalledWith(1, {
      argCount: 1,
    });
  });
});
