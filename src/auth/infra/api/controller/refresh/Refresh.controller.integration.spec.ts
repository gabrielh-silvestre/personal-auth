import type { Request } from 'express';
import { Test } from '@nestjs/testing';

import { RefreshController } from './Refresh.controller.js';
import { RefreshUseCase } from '@auth/useCase/refresh/Refresh.useCase.js';

import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter.js';
import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.js';

import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service.js';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service.js';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock.js';
import {
  DATABASE_ADAPTER,
  DATABASE_GATEWAY,
} from '@auth/utils/constants/index.js';

const [, , , { userId }] = TOKENS_MOCK;

const VALID_REFRESH_REST = {
  user: { userId },
} as Request;

describe('Integration test for Refresh controller', () => {
  let refreshController: RefreshController;

  beforeEach(async () => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [RefreshController],
      providers: [
        RefreshUseCase,
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
          useValue: { sign: vi.fn().mockResolvedValue('access') },
        },
        {
          provide: JwtRefreshService,
          useValue: { sign: vi.fn().mockResolvedValue('refresh') },
        },
      ],
    }).compile();

    refreshController = module.get<RefreshController>(RefreshController);
  });

  describe('should refresh token', () => {
    it('with REST request', async () => {
      const token = await refreshController.handleRest(VALID_REFRESH_REST);

      expect(token).not.toBeNull();
      expect(token).toStrictEqual({
        access: expect.any(String),
        refresh: expect.any(String),
      });
    });

    it('with gRPC request', async () => {
      const token = await refreshController.handleGrpc(VALID_REFRESH_REST);

      expect(token).not.toBeNull();
      expect(token).toStrictEqual({
        access: expect.any(String),
        refresh: expect.any(String),
      });
    });
  });
});
