import {
  context,
  SpanStatusCode,
  trace,
  type AttributeValue,
  type Context,
  type Span,
  type SpanOptions,
} from '@opentelemetry/api';

import { TracerNames } from './constants';

export class SpanBuilder {
  private opts: SpanOptions = {};
  private explicitContext?: Context;

  constructor(private readonly name: string) {}

  asRoot(): this {
    this.opts = { ...this.opts, root: true };
    return this;
  }

  withAttributes(attributes: Record<string, AttributeValue>): this {
    this.opts = {
      ...this.opts,
      attributes: { ...(this.opts.attributes ?? {}), ...attributes },
    };
    return this;
  }

  withOptions(options: SpanOptions): this {
    this.opts = { ...this.opts, ...options };
    return this;
  }

  withContext(ctx: Context): this {
    this.explicitContext = ctx;
    return this;
  }

  async run<T>(fn: (span: Span) => T | Promise<T>): Promise<T> {
    const tracer = trace.getTracer(TracerNames.AUTH);
    const ctx = this.explicitContext ?? context.active();
    return tracer.startActiveSpan(this.name, this.opts, ctx, async (span) => {
      try {
        return await fn(span);
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error)?.message,
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
