import {
  SpanStatusCode,
  trace,
  type AttributeValue,
  type Span,
  type SpanStatus,
} from '@opentelemetry/api';

import { SpanBuilder } from './spans';

export class Telemetry {
  /** No-op when no active span / no global provider. */
  static getActiveSpan(): Span | undefined {
    return trace.getActiveSpan();
  }

  /** No-op when no active span / no global provider. */
  static setAttributes(attributes: Record<string, AttributeValue>): void {
    trace.getActiveSpan()?.setAttributes(attributes);
  }

  /** No-op when no active span / no global provider. */
  static addEvent(
    name: string,
    attributes?: Record<string, AttributeValue>,
  ): void {
    trace.getActiveSpan()?.addEvent(name, attributes);
  }

  /** No-op when no active span / no global provider. */
  static setStatus(status: SpanStatus): void {
    trace.getActiveSpan()?.setStatus(status);
  }

  /**
   * Records the exception on the active span AND sets status to ERROR.
   * Backends like Tempo/Jaeger/Grafana filter and alert on
   * span.status.code=ERROR; recording the exception event without flipping
   * status leaves error spans invisible to dashboards.
   * No-op when no active span / no global provider.
   */
  static recordExceptionIfActive(error: unknown): void {
    const span = trace.getActiveSpan();
    if (!span) return;
    const err = error instanceof Error ? error : new Error(String(error));
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  }

  /**
   * No-op when no global provider; the returned SpanBuilder produces
   * non-recording spans so run() still invokes fn — without span side effects.
   */
  static createSpan(name: string): SpanBuilder {
    return new SpanBuilder(name);
  }
}
