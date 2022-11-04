import type { Request } from 'express';
import { Test } from '@nestjs/testing';

import { RefreshController } from './Refresh.controller';
import { RefreshUseCase } from '@auth/useCase/refresh/Refresh.useCase';

import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const VALID_REFRESH_REST = {
  user: {
    userId: USERS_MOCK[0].id,
  },
} as Request;

describe('Integration test for Refresh controller', () => {
  let refreshController: RefreshController;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        RefreshController,
        RefreshUseCase,
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            generateRefreshToken: jest.fn().mockResolvedValue({
              tokenId: 'token-id',
              userId: 'user-id',
            }),
          },
        },
        {
          provide: JwtRefreshService,
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
        token: expect.any(String),
      });
    });

    it('with gRPC request', async () => {
      const token = await refreshController.handleGrpc(VALID_REFRESH_REST);

      expect(token).not.toBeNull();
      expect(token).toStrictEqual({
        token: expect.any(String),
      });
    });
  });
});
