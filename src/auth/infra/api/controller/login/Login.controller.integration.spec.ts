import { Test } from '@nestjs/testing';

import { LoginController } from './Login.controller';
import { LoginUseCase } from '@auth/useCase/login/Login.useCase';

import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';

import { PasswordFactory } from '@users/domain/factory/Password.factory';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { USERS_MOCK } from '@shared/utils/mocks/users.mock';
import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';

const VALID_LOGIN = {
  email: USERS_MOCK[0].email,
  password: 'password',
};

describe('Integration test for Login controller', () => {
  let loginController: LoginController;

  beforeAll(() => {
    USERS_MOCK[0].changePassword(PasswordFactory.createNew('password'));
  });

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        LoginController,
        LoginUseCase,
        {
          provide: 'USER_REPO',
          useClass: UserInMemoryRepository,
        },
        {
          provide: 'TOKEN_REPO',
          useClass: TokenInMemoryRepository,
        },
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue({
              tokenId: 'token-id',
              userId: 'user-id',
            }),
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
            findByEmail: jest.fn().mockResolvedValue(USERS_MOCK[0]),
          },
        },
      ],
    }).compile();

    loginController = module.get<LoginController>(LoginController);
  });

  describe('should login', () => {
    it('with REST request', async () => {
      const response = await loginController.handleRest(VALID_LOGIN);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        access: expect.any(String),
        refresh: expect.any(String),
      });
    });

    it('with gRPC request', async () => {
      const response = await loginController.handleGrpc(VALID_LOGIN);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        access: expect.any(String),
        refresh: expect.any(String),
      });
    });
  });
});
