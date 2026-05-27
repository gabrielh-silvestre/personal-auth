import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongooseInstrumentation } from '@opentelemetry/instrumentation-mongoose';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import type { Instrumentation } from '@opentelemetry/instrumentation';

import type { TelemetryEnv } from './env';

// Mongoose dbStatementSerializer: returns operation name only, dropping
// the query payload entirely so PII (emails, password resets, raw
// filters) never reaches the collector. Per plan §4 (rev3) until the
// dedicated redaction policy ADR lands. The second argument is required
// by the @opentelemetry/instrumentation-mongoose signature but
// intentionally ignored.
export const mongooseDbStatementSerializer = (
  operation: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _payload?: unknown,
): string => operation;

interface Candidate {
  key: string;
  build: () => Instrumentation;
}

const candidates: Candidate[] = [
  { key: 'http', build: () => new HttpInstrumentation() },
  { key: 'express', build: () => new ExpressInstrumentation() },
  { key: 'nestjs-core', build: () => new NestInstrumentation() },
  // gRPC server-only — the repo has no outbound gRPC client; verified by
  // `grep -rn "ClientGrpc\|GrpcClient\|@Inject.*GRPC_PACKAGE" src` returning 0.
  { key: 'grpc', build: () => new GrpcInstrumentation() },
  { key: 'amqplib', build: () => new AmqplibInstrumentation() },
  {
    key: 'mongoose',
    build: () =>
      new MongooseInstrumentation({
        requireParentSpan: true,
        dbStatementSerializer: mongooseDbStatementSerializer,
      }),
  },
];

export const buildAutoInstrumentations = (
  env: Pick<TelemetryEnv, 'OTEL_NODE_DISABLED_INSTRUMENTATIONS'>,
): Instrumentation[] => {
  const disabled = new Set(env.OTEL_NODE_DISABLED_INSTRUMENTATIONS);
  return candidates
    .filter((candidate) => !disabled.has(candidate.key))
    .map((candidate) => candidate.build());
};
