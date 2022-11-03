import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

import { LoginController } from './Login.controller';
import { LoginUseCase } from '@auth/useCase/login/Login.useCase';

import { PasswordFactory } from '@users/domain/factory/Password.factory';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';

import { GetUserByEmailUseCase } from '@users/useCase/getByEmail/GetUserByEmail.useCase';
import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';
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
    UserInMemoryRepository.reset(USERS_MOCK);
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      imports: [JwtModule.register(JWT_OPTIONS_MOCK)],
      providers: [
        LoginController,
        LoginUseCase,
        CreateTokenUseCase,
        ValidateTokenUseCase,
        GetUserByIdUseCase,
        GetUserByEmailUseCase,
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
            generateAccessToken: jest.fn().mockResolvedValue('token'),
          },
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
        token: expect.any(String),
      });
    });

    it('with gRPC request', async () => {
      const response = await loginController.handleGrpc(VALID_LOGIN);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        token: expect.any(String),
      });
    });
  });
});
