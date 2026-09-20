import type { Request } from 'express';

import { Test } from '@nestjs/testing';
import { from } from 'rxjs';

import { LoginController } from '#auth/infra/api/controller/login/Login.controller';
import { LoginUseCase } from '#auth/useCase/login/Login.useCase';

import { DatabaseMemoryAdapter } from '#auth/infra/adapter/database/memory/DatabaseMemory.adapter';
import { DatabaseGateway } from '#auth/infra/gateway/database/Database.gateway';

import { JwtAccessService } from '#shared/modules/jwt/JwtAccess.service';
import { JwtRefreshService } from '#shared/modules/jwt/JwtRefresh.service';

import { TOKENS_MOCK } from '#shared/utils/mocks/tokens.mock';
import {
  DATABASE_ADAPTER,
  DATABASE_GATEWAY,
} from '#auth/utils/constants/index';

const [{ userId }] = TOKENS_MOCK;

describe('Integration test for Login controller', () => {
  let loginController: LoginController;

  beforeEach(async () => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        LoginUseCase,
        {
          provide: DATABASE_ADAPTER,
          useClass: DatabaseMemoryAdapter,
        },
        {
          provide: DATABASE_GATEWAY,
          useClass: DatabaseGateway,
        },
        {
          provide: JwtAccessService,
          useValue: {
            sign: vi.fn().mockReturnValue('access'),
          },
        },
        {
          provide: JwtRefreshService,
          useValue: {
            sign: vi.fn().mockReturnValue('refresh'),
          },
        },
        {
          provide: 'USER_SERVICE',
          useValue: {
            verifyCredentials: vi.fn().mockResolvedValue(from([{ id: '1' }])),
          },
        },
      ],
    }).compile();

    loginController = module.get<LoginController>(LoginController);
  });

  describe('should login', () => {
    it('with REST request', async () => {
      const response = await loginController.handleRest({
        user: { userId },
      } as Request);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        access: expect.any(String),
        refresh: expect.any(String),
      });
    });

    it('with gRPC request', async () => {
      const response = await loginController.handleGrpc({
        user: { userId },
      } as Request);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        access: expect.any(String),
        refresh: expect.any(String),
      });
    });
  });
});
