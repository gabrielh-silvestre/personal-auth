import {
  context,
  propagation,
  trace,
  type SpanContext,
} from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import { withExtractedAmqpContext } from '../helpers';

describe('withExtractedAmqpContext', () => {
  let provider: BasicTracerProvider;
  let exporter: InMemorySpanExporter;
  let cm: AsyncLocalStorageContextManager;

  beforeAll(() => {
    exporter = new InMemorySpanExporter();
    provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);
    propagation.setGlobalPropagator(
      new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
        ],
      }),
    );
    cm = new AsyncLocalStorageContextManager();
    cm.enable();
    context.setGlobalContextManager(cm);
  });

  afterAll(async () => {
    await provider.shutdown();
    trace.disable();
    propagation.disable();
    cm.disable();
    context.disable();
  });

  beforeEach(() => exporter.reset());

  it('extracts traceparent from properties.headers and starts a child span on the same trace', async () => {
    const traceId = '0af7651916cd43dd8448eb211c80319c';
    const parentSpanId = 'b7ad6b7169203331';
    const traceparent = `00-${traceId}-${parentSpanId}-01`;

    await withExtractedAmqpContext(
      { headers: { traceparent } },
      'AuthRmqController.login',
      async () => undefined,
    );

    const [recorded] = exporter.getFinishedSpans();
    expect(recorded.name).toBe('AuthRmqController.login');
    const spanCtx = recorded.spanContext() as SpanContext;
    expect(spanCtx.traceId).toBe(traceId);
    expect(recorded.parentSpanContext?.spanId).toBe(parentSpanId);
  });

  it('produces a new root span when no traceparent is present', async () => {
    await withExtractedAmqpContext(
      { headers: {} },
      'AuthRmqController.refresh',
      async () => undefined,
    );

    const [recorded] = exporter.getFinishedSpans();
    expect(recorded.name).toBe('AuthRmqController.refresh');
    expect(recorded.parentSpanContext).toBeUndefined();
  });

  it('records the exception and rethrows when fn throws', async () => {
    const err = new Error('rmq-boom');
    await expect(
      withExtractedAmqpContext(
        undefined,
        'AuthRmqController.boom',
        async () => {
          throw err;
        },
      ),
    ).rejects.toBe(err);

    const [recorded] = exporter.getFinishedSpans();
    expect(recorded.events.map((e) => e.name)).toContain('exception');
  });
});
