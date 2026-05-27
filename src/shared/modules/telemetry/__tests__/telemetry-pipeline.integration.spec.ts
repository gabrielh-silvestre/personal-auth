import type { Request } from 'express';

import { context, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Test } from '@nestjs/testing';
import { from } from 'rxjs';

import { LoginController } from '@auth/infra/api/controller/login/Login.controller';
import { LoginUseCase } from '@auth/useCase/login/Login.useCase';
import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter';
import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';
import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { DATABASE_ADAPTER, DATABASE_GATEWAY } from '@auth/utils/constants';

import { AttributeKeys, Transport } from '../constants';

const [{ userId }] = TOKENS_MOCK;

describe('telemetry pipeline (integration)', () => {
  let exporter: InMemorySpanExporter;
  let provider: BasicTracerProvider;
  let cm: AsyncLocalStorageContextManager;
  let loginController: LoginController;

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

  beforeEach(async () => {
    exporter.reset();
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    const moduleRef = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        LoginUseCase,
        { provide: DATABASE_ADAPTER, useClass: DatabaseMemoryAdapter },
        { provide: DATABASE_GATEWAY, useClass: DatabaseGateway },
        {
          provide: JwtAccessService,
          useValue: { sign: jest.fn().mockReturnValue('access') },
        },
        {
          provide: JwtRefreshService,
          useValue: { sign: jest.fn().mockReturnValue('refresh') },
        },
        {
          provide: 'USER_SERVICE',
          useValue: {
            verifyCredentials: jest.fn().mockResolvedValue(from([{ id: '1' }])),
          },
        },
      ],
    }).compile();

    loginController = moduleRef.get<LoginController>(LoginController);
  });

  it('REST handler emits a span carrying auth.userId and auth.transport=rest', async () => {
    const tracer = trace.getTracer('integration-test');
    await tracer.startActiveSpan('TEST.outer', async (outer) => {
      await loginController.handleRest({ user: { userId } } as Request);
      outer.end();
    });

    const spans = exporter.getFinishedSpans();
    const target = spans.find(
      (s) => s.attributes[AttributeKeys.AUTH_USER_ID] !== undefined,
    );
    expect(target).toBeDefined();
    expect(target!.attributes[AttributeKeys.AUTH_USER_ID]).toBe(userId);
    expect(target!.attributes[AttributeKeys.AUTH_TRANSPORT]).toBe(
      Transport.REST,
    );
  });

  it('gRPC handler tags the active span with auth.transport=grpc', async () => {
    const tracer = trace.getTracer('integration-test');
    await tracer.startActiveSpan('TEST.outer', async (outer) => {
      await loginController.handleGrpc({ user: { userId } } as Request);
      outer.end();
    });

    const spans = exporter.getFinishedSpans();
    const target = spans.find(
      (s) => s.attributes[AttributeKeys.AUTH_TRANSPORT] === Transport.GRPC,
    );
    expect(target).toBeDefined();
    expect(target!.attributes[AttributeKeys.AUTH_USER_ID]).toBe(userId);
  });
});
