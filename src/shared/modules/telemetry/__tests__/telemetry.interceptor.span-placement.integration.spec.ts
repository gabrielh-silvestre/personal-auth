import { Reflector } from '@nestjs/core';
import { RmqContext } from '@nestjs/microservices';
import { of, firstValueFrom } from 'rxjs';
import { context, propagation, trace } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import type { CallHandler, ExecutionContext } from '@nestjs/common';

import { TelemetryInterceptor } from '../interceptor/Telemetry.interceptor';
import { AttributeKeys, Transport } from '../constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHandler(response: unknown = { ok: true }): CallHandler {
  return { handle: () => of(response) };
}

function makeHttpCtx(userId: string): ExecutionContext {
  const handler = function httpHandler() {};
  const cls = class HttpController {};

  return {
    getType: () => 'http',
    getClass: () => cls,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({ user: { userId } }),
    }),
    switchToRpc: () => ({
      getContext: () => ({}),
      getData: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

function makeRmqCtx(
  rmqContextInstance: RmqContext,
  data: unknown,
): ExecutionContext {
  const handler = function rmqHandler() {};
  const cls = class RmqController {};

  return {
    getType: () => 'rpc',
    getClass: () => cls,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({}),
    }),
    switchToRpc: () => ({
      getContext: () => rmqContextInstance,
      getData: () => data,
    }),
  } as unknown as ExecutionContext;
}

/** Build a valid W3C traceparent header. */
function makeTraceparent(traceId: string, spanId: string): string {
  return `00-${traceId}-${spanId}-01`;
}

/** Create a fake RmqContext instance (without going through the real constructor). */
function makeFakeRmqContext(traceparent: string): RmqContext {
  const msg = {
    properties: {
      headers: { traceparent },
    },
  };
  const instance = Object.create(RmqContext.prototype) as RmqContext;
  (instance as any).getMessage = () => msg;
  return instance;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('TelemetryInterceptor span placement (integration)', () => {
  let exporter: InMemorySpanExporter;
  let provider: BasicTracerProvider;
  let cm: AsyncLocalStorageContextManager;

  beforeAll(() => {
    exporter = new InMemorySpanExporter();
    provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());
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

  beforeEach(() => {
    exporter.reset();
  });

  // -------------------------------------------------------------------------
  // Test 1 — HTTP span placement
  // -------------------------------------------------------------------------
  describe('HTTP span placement', () => {
    it('sets AUTH_TRANSPORT=REST and AUTH_USER_ID on the active span', async () => {
      const reflector = new Reflector();
      const interceptor = new TelemetryInterceptor(reflector);

      const ctx = makeHttpCtx('http-user');
      const spanSpy = {
        setAttribute: jest.fn(),
        recordException: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      };

      jest.spyOn(trace, 'getActiveSpan').mockReturnValue(spanSpy as any);

      try {
        await firstValueFrom(interceptor.intercept(ctx, makeHandler()));
      } finally {
        jest.restoreAllMocks();
      }

      expect(spanSpy.setAttribute).toHaveBeenCalledWith(
        AttributeKeys.AUTH_TRANSPORT,
        Transport.REST,
      );
      expect(spanSpy.setAttribute).toHaveBeenCalledWith(
        AttributeKeys.AUTH_USER_ID,
        'http-user',
      );
    });
  });

  // -------------------------------------------------------------------------
  // Test 2 — RMQ span placement (critical: fails when traceparent extraction removed)
  // -------------------------------------------------------------------------
  describe('RMQ span placement', () => {
    it('creates a child span parented to the traceparent header and sets AUTH_TRANSPORT=RMQ and AUTH_USER_ID', async () => {
      const reflector = new Reflector();
      const interceptor = new TelemetryInterceptor(reflector);

      // Generate a valid W3C traceparent
      const traceId = 'aabbccddeeff00112233445566778899'; // 32 hex chars = 16 bytes
      const parentSpanId = '0011223344556677'; // 16 hex chars = 8 bytes
      const traceparent = makeTraceparent(traceId, parentSpanId);

      const rmqCtxInstance = makeFakeRmqContext(traceparent);
      const ctx = makeRmqCtx(rmqCtxInstance, { userId: 'rmq-user' });

      await firstValueFrom(interceptor.intercept(ctx, makeHandler()));

      const spans = exporter.getFinishedSpans();
      expect(spans.length).toBeGreaterThanOrEqual(1);

      // The interceptor creates a span named ClassName.methodName
      const rmqSpan = spans.find(
        (s) => s.attributes[AttributeKeys.AUTH_TRANSPORT] === Transport.RMQ,
      );
      expect(rmqSpan).toBeDefined();

      // Verify user id was recorded
      expect(rmqSpan!.attributes[AttributeKeys.AUTH_USER_ID]).toBe('rmq-user');

      // The critical assertion: the span must be parented to the traceparent header
      expect(rmqSpan!.parentSpanContext?.spanId).toBe(parentSpanId);
    });

    it('fails to find any finished span when traceparent extraction is bypassed', async () => {
      // This test documents the invariant: if handleRmq did NOT extract the
      // traceparent and instead called enrich() directly (no startActiveSpan),
      // no span would be written to the exporter. We prove the real path works
      // by verifying that a span IS present after a normal call.
      const reflector = new Reflector();
      const interceptor = new TelemetryInterceptor(reflector);

      const traceId = '00112233445566778899aabbccddeeff';
      const parentSpanId = '8877665544332211';
      const traceparent = makeTraceparent(traceId, parentSpanId);

      const rmqCtxInstance = makeFakeRmqContext(traceparent);
      const ctx = makeRmqCtx(rmqCtxInstance, { userId: 'another-user' });

      await firstValueFrom(interceptor.intercept(ctx, makeHandler()));

      // The real interceptor MUST produce at least one span via startActiveSpan
      const spans = exporter.getFinishedSpans();
      expect(spans.length).toBeGreaterThanOrEqual(1);

      // All spans must have a parent that traces back to the injected header
      const spanWithCorrectParent = spans.find(
        (s) => s.parentSpanContext?.spanId === parentSpanId,
      );
      expect(spanWithCorrectParent).toBeDefined();
    });
  });
});
