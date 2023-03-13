import type { Request } from 'express';

import { Test } from '@nestjs/testing';
import { from } from 'rxjs';

import { LoginController } from './Login.controller';
import { LoginUseCase } from '@auth/useCase/login/Login.useCase';

import { OrmMemoryAdapter } from '@auth/infra/adapter/orm/memory/OrmMemory.adapter';
import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';

import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';
import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { ORM_ADAPTER, DATABASE_GATEWAY } from '@auth/utils/constants';

const [{ userId }] = TOKENS_MOCK;

describe('Integration test for Login controller', () => {
  let loginController: LoginController;

  beforeEach(async () => {
    OrmMemoryAdapter.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        LoginUseCase,
        {
          provide: ORM_ADAPTER,
          useClass: OrmMemoryAdapter,
        },
        {
          provide: DATABASE_GATEWAY,
          useClass: DatabaseGateway,
        },
        {
          provide: JwtAccessService,
          useValue: {
            sign: jest.fn().mockReturnValue('access'),
          },
        },
        {
          provide: JwtRefreshService,
          useValue: {
            sign: jest.fn().mockReturnValue('refresh'),
          },
        },
        {
          provide: 'USER_SERVICE',
          useValue: {
            verifyCredentials: jest.fn().mockResolvedValue(from([{ id: '1' }])),
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
