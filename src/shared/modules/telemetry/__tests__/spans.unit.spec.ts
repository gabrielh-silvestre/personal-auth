import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import { SpanBuilder } from '../spans';

describe('SpanBuilder', () => {
  let provider: BasicTracerProvider;
  let exporter: InMemorySpanExporter;
  let cm: AsyncLocalStorageContextManager;

  beforeAll(() => {
    exporter = new InMemorySpanExporter();
    provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);
    cm = new AsyncLocalStorageContextManager();
    cm.enable();
    context.setGlobalContextManager(cm);
  });

  afterAll(async () => {
    await provider.shutdown();
    trace.disable();
    cm.disable();
    context.disable();
  });

  beforeEach(() => exporter.reset());

  it('runs fn with a started span, ends it, and resolves to fn output', async () => {
    const result = await new SpanBuilder('test.op')
      .withAttributes({ k: 'v' })
      .run(async (span) => {
        expect(trace.getActiveSpan()).toBe(span);
        return 'done';
      });

    expect(result).toBe('done');
    const [recorded] = exporter.getFinishedSpans();
    expect(recorded.name).toBe('test.op');
    expect(recorded.attributes.k).toBe('v');
    expect(recorded.ended).toBe(true);
  });

  it('records exceptions, sets ERROR status, and rethrows', async () => {
    const err = new Error('boom');
    await expect(
      new SpanBuilder('failing.op').run(async () => {
        throw err;
      }),
    ).rejects.toBe(err);

    const [recorded] = exporter.getFinishedSpans();
    expect(recorded.status.code).toBe(SpanStatusCode.ERROR);
    expect(recorded.events.map((e) => e.name)).toContain('exception');
  });

  it('merges attributes across withAttributes chained calls', async () => {
    await new SpanBuilder('chain.op')
      .withAttributes({ a: 1 })
      .withAttributes({ b: 2 })
      .run(async () => undefined);

    const [recorded] = exporter.getFinishedSpans();
    expect(recorded.attributes.a).toBe(1);
    expect(recorded.attributes.b).toBe(2);
  });

  it('asRoot opts the span out of the parent context', async () => {
    const outer = trace.getTracer('test');
    await new Promise<void>((resolve) => {
      outer.startActiveSpan('outer', async (parent) => {
        await new SpanBuilder('child.root').asRoot().run(async () => undefined);
        parent.end();
        resolve();
      });
    });

    const spans = exporter.getFinishedSpans();
    const root = spans.find((s) => s.name === 'child.root');
    const outerSpan = spans.find((s) => s.name === 'outer');
    expect(root).toBeDefined();
    expect(outerSpan).toBeDefined();
    expect(root!.parentSpanContext?.spanId ?? undefined).toBeUndefined();
  });
});
