import {
  context,
  propagation,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';

import { DefaultConfig, TracerNames } from './constants';

const SENSITIVE_HEADER = /password|secret|token|authorization|cookie/i;

const redactHeaders = (headers: unknown): Record<string, unknown> => {
  if (!headers || typeof headers !== 'object') return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(
    headers as Record<string, unknown>,
  )) {
    out[key] = SENSITIVE_HEADER.test(key) ? '[REDACTED]' : value;
  }
  return out;
};

const truncateStack = (stack: unknown): string | undefined => {
  if (typeof stack !== 'string') return undefined;
  return stack
    .split('\n')
    .slice(0, DefaultConfig.EXCEPTION_STACK_MAX_LINES)
    .join('\n');
};

const truncateBody = (body: unknown): string | undefined => {
  if (body === undefined || body === null) return undefined;
  const serialized =
    typeof body === 'string' ? body : (JSON.stringify(body) ?? '');
  return serialized.length > DefaultConfig.EXCEPTION_BODY_MAX_BYTES
    ? serialized.slice(0, DefaultConfig.EXCEPTION_BODY_MAX_BYTES)
    : serialized;
};

const get = (value: unknown, key: string): unknown =>
  value && typeof value === 'object'
    ? (value as Record<string, unknown>)[key]
    : undefined;

export const recordCustomException = (error: unknown): void => {
  const span = trace.getActiveSpan();
  if (!span) return;

  const attrs: Record<string, string | number | boolean> = {};
  const code = get(error, 'code');
  const name = get(error, 'name');
  const message = get(error, 'message');
  const stack = truncateStack(get(error, 'stack'));

  if (code !== undefined) attrs['error.code'] = String(code);
  if (name !== undefined) attrs['error.name'] = String(name);
  if (message !== undefined) attrs['error.message'] = String(message);
  if (stack !== undefined) attrs['error.stack'] = stack;

  const request = get(error, 'request');
  const response = get(error, 'response');

  if (request || response) {
    const url = get(request, 'url');
    const method = get(request, 'method');
    const status = get(response, 'status') ?? get(response, 'statusCode');
    if (url !== undefined) attrs['http.url'] = String(url);
    if (method !== undefined) attrs['http.method'] = String(method);
    if (status !== undefined) attrs['http.status_code'] = Number(status);

    const reqHeaders = get(request, 'headers');
    const resHeaders = get(response, 'headers');
    if (reqHeaders)
      attrs['http.request.headers'] = JSON.stringify(redactHeaders(reqHeaders));
    if (resHeaders)
      attrs['http.response.headers'] = JSON.stringify(
        redactHeaders(resHeaders),
      );

    const body = truncateBody(get(response, 'body'));
    if (body !== undefined) attrs['http.response.body'] = body;
  }

  span.recordException(error as Error);
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: message !== undefined ? String(message) : undefined,
  });
  if (Object.keys(attrs).length > 0) span.setAttributes(attrs);
};

export const withExtractedAmqpContext = <T>(
  properties: { headers?: Record<string, unknown> } | undefined,
  spanName: string,
  fn: () => Promise<T>,
): Promise<T> => {
  // AMQP headers can hold Buffer | number | object values per the protocol;
  // propagation.extract only consumes string values, so non-string headers
  // are silently ignored (causes no error, just no parent context extracted).
  const carrier = (properties?.headers ?? {}) as Record<string, string>;
  const parentCtx = propagation.extract(context.active(), carrier);
  const tracer = trace.getTracer(TracerNames.RMQ);
  return context.with(parentCtx, () =>
    tracer.startActiveSpan(spanName, async (span) => {
      try {
        return await fn();
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
    }),
  );
};
