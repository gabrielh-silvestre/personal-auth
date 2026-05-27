import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import { Telemetry } from '../telemetry';

const enableContextManager = (): AsyncLocalStorageContextManager => {
  const cm = new AsyncLocalStorageContextManager();
  cm.enable();
  context.setGlobalContextManager(cm);
  return cm;
};

describe('Telemetry facade', () => {
  describe('no-op contract — no active span / no provider registered', () => {
    it('getActiveSpan returns undefined and other methods do not throw', () => {
      expect(Telemetry.getActiveSpan()).toBeUndefined();
      expect(() => Telemetry.setAttributes({ k: 1 })).not.toThrow();
      expect(() => Telemetry.addEvent('e', { v: 1 })).not.toThrow();
      expect(() =>
        Telemetry.setStatus({ code: SpanStatusCode.ERROR }),
      ).not.toThrow();
      expect(() =>
        Telemetry.recordExceptionIfActive(new Error('boom')),
      ).not.toThrow();
    });
  });

  describe('with a registered TracerProvider and an active span', () => {
    let provider: BasicTracerProvider;
    let exporter: InMemorySpanExporter;
    let cm: AsyncLocalStorageContextManager;

    beforeAll(() => {
      exporter = new InMemorySpanExporter();
      provider = new BasicTracerProvider({
        spanProcessors: [new SimpleSpanProcessor(exporter)],
      });
      trace.setGlobalTracerProvider(provider);
      cm = enableContextManager();
    });

    afterAll(async () => {
      await provider.shutdown();
      trace.disable();
      cm.disable();
      context.disable();
    });

    beforeEach(() => exporter.reset());

    it('setAttributes and addEvent and setStatus mutate the active span', async () => {
      const tracer = trace.getTracer('test');
      await new Promise<void>((resolve) =>
        tracer.startActiveSpan('parent', (span) => {
          Telemetry.setAttributes({ 'auth.userId': 'u-1' });
          Telemetry.addEvent('checked', { kind: 'token' });
          Telemetry.setStatus({ code: SpanStatusCode.OK });
          Telemetry.recordExceptionIfActive(new Error('handled'));
          span.end();
          resolve();
        }),
      );

      const [recorded] = exporter.getFinishedSpans();
      expect(recorded.attributes['auth.userId']).toBe('u-1');
      expect(recorded.events.map((e) => e.name)).toContain('checked');
      expect(recorded.status.code).toBe(SpanStatusCode.OK);
      // recordException adds an event of name "exception"
      expect(recorded.events.map((e) => e.name)).toContain('exception');
    });
  });

  describe('createSpan returns a SpanBuilder', () => {
    it('whose run() invokes the function and never throws when no provider is registered', async () => {
      trace.disable();
      const builder = Telemetry.createSpan('orphan');
      await expect(builder.run(async () => 42)).resolves.toBe(42);
    });
  });

  describe('JSDoc no-op convention (M9)', () => {
    it('marks every public static method with the "No-op" note', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs: typeof import('node:fs') = require('node:fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sourcePath: string = require.resolve('../telemetry.ts');
      const source = fs.readFileSync(sourcePath, 'utf8');
      const methodNames = [
        'getActiveSpan',
        'setAttributes',
        'addEvent',
        'setStatus',
        'recordExceptionIfActive',
        'createSpan',
      ];
      for (const name of methodNames) {
        const idx = source.indexOf(`static ${name}`);
        expect(idx).toBeGreaterThan(-1);
        const preceding = source.slice(Math.max(0, idx - 200), idx);
        expect(preceding).toMatch(/No-op/);
      }
    });
  });

  it('createSpan + Telemetry.setAttributes also work together with a provider', async () => {
    const exporter = new InMemorySpanExporter();
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);
    const cm = enableContextManager();

    await Telemetry.createSpan('orchestrated').run(async () => {
      Telemetry.setAttributes({ key: 'value' });
    });

    const [span] = exporter.getFinishedSpans();
    expect(span.name).toBe('orchestrated');
    expect(span.attributes.key).toBe('value');

    await provider.shutdown();
    trace.disable();
    cm.disable();
    context.disable();
  });
});
