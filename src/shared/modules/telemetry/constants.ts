export const AttributeKeys = {
  AUTH_USER_ID: 'auth.userId',
  AUTH_TOKEN_TYPE: 'auth.tokenType',
  AUTH_TRANSPORT: 'auth.transport',
} as const;

export const MeterNames = {
  AUTH: 'personal-auth.auth',
  HTTP: 'personal-auth.http',
  RMQ: 'personal-auth.rmq',
} as const;

export const TracerNames = {
  RMQ: 'personal-auth.rmq',
  AUTH: 'personal-auth.auth',
} as const;

export const Transport = {
  REST: 'rest',
  GRPC: 'grpc',
  RMQ: 'rmq',
} as const;

export const DefaultConfig = {
  OTLP_ENDPOINT: 'http://otel-collector:4317',
  OTLP_LOGS_ENDPOINT: 'http://otel-collector:4318/v1/logs',
  METRIC_EXPORT_INTERVAL_MS: 60_000,
  EXCEPTION_BODY_MAX_BYTES: 4 * 1024,
  EXCEPTION_STACK_MAX_LINES: 50,
  SAMPLER: 'parentbased_always_on',
} as const;
