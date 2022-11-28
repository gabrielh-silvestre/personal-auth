import { Test } from '@nestjs/testing';

import { LoginController } from './Login.controller';
import { LoginUseCase } from '@auth/useCase/login/Login.useCase';

import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';
import { JwtRefreshService } from '@shared/modules/jwt/JwtRefresh.service';

import { PasswordFactory } from '@users/domain/factory/Password.factory';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { UserMemoryGateway } from '@users/infra/gateway/database/memory/UserMemory.gateway';
import { UserRepository } from '@users/infra/repository/User.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

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
    UserMemoryGateway.reset(USERS_MOCK);
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        LoginController,
        LoginUseCase,
        {
          provide: 'USER_DATABASE',
          useClass: UserMemoryGateway,
        },
        {
          provide: 'USER_REPO',
          useClass: UserRepository,
        },
        {
          provide: 'TOKEN_REPO',
          useClass: TokenInMemoryRepository,
        },
        {
          provide: 'TOKEN_SERVICE',
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
