import { Reflector } from '@nestjs/core';
import { of, throwError, firstValueFrom } from 'rxjs';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { CallHandler, ExecutionContext } from '@nestjs/common';

import { TelemetryInterceptor } from '../interceptor/Telemetry.interceptor';
import { AttributeKeys, Transport } from '../constants';
import { TelemetryTokenType } from '../metadata';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSpan() {
  return {
    setAttribute: jest.fn(),
    recordException: jest.fn(),
    setStatus: jest.fn(),
    end: jest.fn(),
  };
}

function makeHttpCtx(userId?: string) {
  const handler = function handler() {};
  const cls = class TargetClass {};

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

function makeGrpcCtx(userId?: string) {
  const handler = function handler() {};
  const cls = class TargetClass {};

  // getContext() returns a plain object — NOT an RmqContext instance
  const plainRpcContext = Object.create(Object.prototype);

  return {
    getType: () => 'rpc',
    getClass: () => cls,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({}),
    }),
    switchToRpc: () => ({
      getContext: () => plainRpcContext,
      getData: () => ({ user: { userId } }),
    }),
  } as unknown as ExecutionContext;
}

function makeHandler(response: unknown = { ok: true }) {
  return { handle: () => of(response) } as CallHandler;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TelemetryInterceptor (unit)', () => {
  let reflector: Reflector;
  let interceptor: TelemetryInterceptor;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new TelemetryInterceptor(reflector);
    jest.restoreAllMocks();
  });

  describe('when there is no active span', () => {
    it('returns next.handle() untouched without calling any span methods', async () => {
      jest.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined);

      const ctx = makeHttpCtx('u1');
      const handler = makeHandler('payload');

      const result = await firstValueFrom(interceptor.intercept(ctx, handler));

      expect(result).toBe('payload');
      expect(trace.getActiveSpan).toHaveBeenCalled();
    });
  });

  describe('HTTP path', () => {
    it('sets AUTH_TRANSPORT=REST and AUTH_USER_ID from req.user.userId', async () => {
      const span = makeSpan();
      jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span as any);

      const ctx = makeHttpCtx('u1');
      const handler = makeHandler();

      await firstValueFrom(interceptor.intercept(ctx, handler));

      expect(span.setAttribute).toHaveBeenCalledWith(
        AttributeKeys.AUTH_TRANSPORT,
        Transport.REST,
      );
      expect(span.setAttribute).toHaveBeenCalledWith(
        AttributeKeys.AUTH_USER_ID,
        'u1',
      );
    });
  });

  describe('gRPC path', () => {
    it('sets AUTH_TRANSPORT=GRPC and AUTH_USER_ID from rpc data when context is not RmqContext', async () => {
      const span = makeSpan();
      jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span as any);

      const ctx = makeGrpcCtx('u2');
      const handler = makeHandler();

      await firstValueFrom(interceptor.intercept(ctx, handler));

      expect(span.setAttribute).toHaveBeenCalledWith(
        AttributeKeys.AUTH_TRANSPORT,
        Transport.GRPC,
      );
      expect(span.setAttribute).toHaveBeenCalledWith(
        AttributeKeys.AUTH_USER_ID,
        'u2',
      );
    });
  });

  describe('@TelemetryTokenType metadata', () => {
    it('sets AUTH_TOKEN_TYPE when handler is decorated with @TelemetryTokenType("recover")', async () => {
      const span = makeSpan();
      jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span as any);

      class MyController {
        @TelemetryTokenType('recover')
        myMethod() {}
      }

      const ctx = {
        getType: () => 'http',
        getClass: () => MyController,
        getHandler: () => MyController.prototype.myMethod,
        switchToHttp: () => ({
          getRequest: () => ({ user: { userId: 'u3' } }),
        }),
        switchToRpc: () => ({
          getContext: () => ({}),
          getData: () => ({}),
        }),
      } as unknown as ExecutionContext;

      await firstValueFrom(interceptor.intercept(ctx, makeHandler()));

      expect(span.setAttribute).toHaveBeenCalledWith(
        AttributeKeys.AUTH_TOKEN_TYPE,
        'recover',
      );
    });

    it('does not set AUTH_TOKEN_TYPE when handler has no @TelemetryTokenType decoration', async () => {
      const span = makeSpan();
      jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span as any);

      await firstValueFrom(
        interceptor.intercept(makeHttpCtx('u1'), makeHandler()),
      );

      const tokenTypeCalls = span.setAttribute.mock.calls.filter(
        ([key]) => key === AttributeKeys.AUTH_TOKEN_TYPE,
      );
      expect(tokenTypeCalls).toHaveLength(0);
    });
  });

  describe('when the handler throws', () => {
    it('calls span.recordException and span.setStatus with ERROR, and the observable errors', async () => {
      const span = makeSpan();
      jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span as any);

      const boom = new Error('boom');
      const errorHandler: CallHandler = {
        handle: () => throwError(() => boom),
      };

      await expect(
        firstValueFrom(interceptor.intercept(makeHttpCtx('u1'), errorHandler)),
      ).rejects.toThrow('boom');

      expect(span.recordException).toHaveBeenCalledWith(boom);
      expect(span.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
        message: 'boom',
      });
    });
  });

  describe('response pass-through', () => {
    it('emits the original response value unchanged', async () => {
      const span = makeSpan();
      jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span as any);

      const payload = { token: 'abc123', userId: 'u5' };
      const result = await firstValueFrom(
        interceptor.intercept(makeHttpCtx('u5'), makeHandler(payload)),
      );

      expect(result).toBe(payload);
    });
  });
});
