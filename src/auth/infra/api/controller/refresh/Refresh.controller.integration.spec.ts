import type { Request } from 'express';
import { Test } from '@nestjs/testing';

import { RefreshController } from './Refresh.controller';
import { RefreshUseCase } from '@auth/useCase/refresh/Refresh.useCase';

import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const VALID_REFRESH_REST = {
  user: {
    userId: '1',
  },
} as Request;

describe('Integration test for Refresh controller', () => {
  let refreshController: RefreshController;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [RefreshController],
      providers: [
        RefreshUseCase,
        {
          provide: TOKEN_GATEWAY,
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue('token-id'),
            generateRefreshToken: jest.fn().mockResolvedValue('token-id'),
          },
        },
        {
          provide: JwtRefreshService,
          useValue: { sign: jest.fn().mockResolvedValue('token') },
        },
        {
          provide: JwtAccessService,
          useValue: { sign: jest.fn().mockResolvedValue('token') },
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
