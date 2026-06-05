import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RmqContext } from '@nestjs/microservices';
import { Observable, finalize, tap } from 'rxjs';
import {
  SpanStatusCode,
  context,
  propagation,
  trace,
  type Span,
} from '@opentelemetry/api';

import { AttributeKeys, TracerNames, Transport } from '../constants';
import { TELEMETRY_TOKEN_TYPE_KEY } from '../metadata';

@Injectable()
export class TelemetryInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.isRmq(ctx)) {
      return this.handleRmq(ctx, next);
    }
    return this.enrich(ctx, next.handle());
  }

  private handleRmq(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const headers = (ctx.switchToRpc().getContext<RmqContext>().getMessage()
      ?.properties?.headers ?? {}) as Record<string, string>;
    const parentCtx = propagation.extract(context.active(), headers);
    const tracer = trace.getTracer(TracerNames.RMQ);

    return new Observable((subscriber) => {
      context.with(parentCtx, () => {
        tracer.startActiveSpan(this.spanName(ctx), (span) => {
          this.enrich(ctx, next.handle())
            .pipe(finalize(() => span.end()))
            .subscribe(subscriber);
        });
      });
    });
  }

  private enrich(
    ctx: ExecutionContext,
    src: Observable<unknown>,
  ): Observable<unknown> {
    const span = trace.getActiveSpan();
    if (!span) return src;

    this.applyTransport(ctx, span);
    const userIdFromInput = this.applyUserIdFromInput(ctx, span);
    this.applyTokenType(ctx, span);

    return src.pipe(
      tap({
        next: (res) => {
          if (!userIdFromInput) this.applyUserIdFromResponse(span, res);
        },
        error: (err) => this.recordError(span, err),
      }),
    );
  }

  private isRmq(ctx: ExecutionContext): boolean {
    if (ctx.getType<string>() !== 'rpc') return false;
    try {
      return ctx.switchToRpc().getContext() instanceof RmqContext;
    } catch {
      return false;
    }
  }

  private spanName(ctx: ExecutionContext): string {
    return `${ctx.getClass().name}.${ctx.getHandler().name}`;
  }

  private applyTransport(ctx: ExecutionContext, span: Span): void {
    let transport: string;
    if (ctx.getType<string>() === 'http') {
      transport = Transport.REST;
    } else if (this.isRmq(ctx)) {
      transport = Transport.RMQ;
    } else {
      transport = Transport.GRPC;
    }
    span.setAttribute(AttributeKeys.AUTH_TRANSPORT, transport);
  }

  /** Returns true when userId was resolved from the inbound payload. */
  private applyUserIdFromInput(ctx: ExecutionContext, span: Span): boolean {
    let userId: unknown;
    if (ctx.getType<string>() === 'http') {
      userId = ctx.switchToHttp().getRequest()?.user?.userId;
    } else {
      const data = ctx.switchToRpc().getData() as
        | Record<string, unknown>
        | undefined;
      const nested = (data?.user as Record<string, unknown> | undefined)
        ?.userId;
      userId = nested ?? data?.userId;
    }
    if (typeof userId === 'string') {
      span.setAttribute(AttributeKeys.AUTH_USER_ID, userId);
      return true;
    }
    return false;
  }

  private applyUserIdFromResponse(span: Span, res: unknown): void {
    const userId = (res as Record<string, unknown> | null)?.userId;
    if (typeof userId === 'string') {
      span.setAttribute(AttributeKeys.AUTH_USER_ID, userId);
    }
  }

  private applyTokenType(ctx: ExecutionContext, span: Span): void {
    const tokenType = this.reflector.get<string>(
      TELEMETRY_TOKEN_TYPE_KEY,
      ctx.getHandler(),
    );
    if (typeof tokenType === 'string') {
      span.setAttribute(AttributeKeys.AUTH_TOKEN_TYPE, tokenType);
    }
  }

  private recordError(span: Span, error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  }
}
