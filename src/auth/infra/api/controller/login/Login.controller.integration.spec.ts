import type { Request } from 'express';

import { Test } from '@nestjs/testing';
import { from } from 'rxjs';

import { LoginController } from './Login.controller';
import { LoginUseCase } from '@auth/useCase/login/Login.useCase';

import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';
import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Integration test for Login controller', () => {
  let loginController: LoginController;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        LoginUseCase,
        {
          provide: TOKEN_GATEWAY,
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue('token-id'),
            generateRefreshToken: jest.fn().mockResolvedValue('token-id'),
          },
        },
        {
          provide: JwtAccessService,
          useValue: { sign: jest.fn().mockResolvedValue('token') },
        },
        {
          provide: JwtRefreshService,
          useValue: { sign: jest.fn().mockResolvedValue('token') },
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
        user: { userId: '1' },
      } as Request);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        access: expect.any(String),
        refresh: expect.any(String),
      });
    });

    it('with gRPC request', async () => {
      const response = await loginController.handleGrpc({ userId: '1' });

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        access: expect.any(String),
        refresh: expect.any(String),
      });
    });
  });
});
