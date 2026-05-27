import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import { DefaultConfig } from '../constants';
import { recordCustomException } from '../helpers';

describe('recordCustomException', () => {
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

  const withSpan = async (
    fn: () => void,
  ): Promise<ReturnType<typeof exporter.getFinishedSpans>[number]> => {
    const tracer = trace.getTracer('test');
    await new Promise<void>((resolve) =>
      tracer.startActiveSpan('host', (span) => {
        fn();
        span.end();
        resolve();
      }),
    );
    return exporter.getFinishedSpans()[0];
  };

  it('is a no-op when there is no active span', () => {
    expect(() => recordCustomException(new Error('orphan'))).not.toThrow();
  });

  it('records code, name, message, and capped stack', async () => {
    const longStack = Array.from({ length: 200 }, (_, i) => `at line${i}`).join(
      '\n',
    );
    const error = Object.assign(new Error('msg'), {
      code: 'E_FOO',
      stack: longStack,
    });

    const span = await withSpan(() => recordCustomException(error));

    expect(span.attributes['error.code']).toBe('E_FOO');
    expect(span.attributes['error.name']).toBe('Error');
    expect(span.attributes['error.message']).toBe('msg');
    const recordedStack = span.attributes['error.stack'] as string;
    expect(recordedStack.split('\n')).toHaveLength(
      DefaultConfig.EXCEPTION_STACK_MAX_LINES,
    );
    expect(span.status.code).toBe(SpanStatusCode.ERROR);
  });

  it('extracts HTTP-shaped request/response fields, redacts sensitive headers, caps body', async () => {
    const bigBody = 'x'.repeat(10 * 1024);
    const error = {
      message: 'fail',
      request: {
        url: 'https://api.example.com/users',
        method: 'POST',
        headers: { authorization: 'Bearer abc', accept: 'application/json' },
      },
      response: {
        status: 502,
        headers: { 'set-cookie': 'sid=xyz', 'x-trace': 'abc' },
        body: bigBody,
      },
    };

    const span = await withSpan(() => recordCustomException(error));

    expect(span.attributes['http.url']).toBe('https://api.example.com/users');
    expect(span.attributes['http.method']).toBe('POST');
    expect(span.attributes['http.status_code']).toBe(502);
    expect(String(span.attributes['http.request.headers'])).toContain(
      '[REDACTED]',
    );
    expect(String(span.attributes['http.request.headers'])).not.toContain(
      'Bearer abc',
    );
    expect(String(span.attributes['http.response.headers'])).toContain(
      '[REDACTED]',
    );
    expect((span.attributes['http.response.body'] as string).length).toBe(
      DefaultConfig.EXCEPTION_BODY_MAX_BYTES,
    );
  });
});
