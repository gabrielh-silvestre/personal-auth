import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

import { LoginUseCase } from './Login.useCase';

import { TokenServiceAdaptor } from '@auth/infra/service/token/Token.service.adaptor';
import { UserServiceAdaptor } from '@auth/infra/service/user/User.service.adaptor';
import { JwtServiceAdaptor } from '@tokens/infra/service/jwt/Jwt.service.adaptor';

import { PasswordFactory } from '@users/domain/factory/Password.factory';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';

import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';
import { GetUserByEmailUseCase } from '@users/useCase/getByEmail/GetUserByEmail.useCase';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { USERS_MOCK } from '@shared/utils/mocks/users.mock';
import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';

const VALID_LOGIN = {
  email: USERS_MOCK[0].email,
  password: 'password',
};

const INVALID_LOGIN = {
  email: USERS_MOCK[0].email,
  password: 'wrong password',
};

describe('Integration test for Login use case', () => {
  let loginUseCase: LoginUseCase;

  beforeAll(() => {
    USERS_MOCK[0].changePassword(PasswordFactory.createNew('password'));
  });

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      imports: [JwtModule.register(JWT_OPTIONS_MOCK)],
      providers: [
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
          useClass: TokenServiceAdaptor,
        },
        {
          provide: 'USER_SERVICE',
          useClass: UserServiceAdaptor,
        },
        { provide: 'JWT_SERVICE', useClass: JwtServiceAdaptor },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should login with success', async () => {
    const token = await loginUseCase.execute(VALID_LOGIN);

    expect(token).not.toBeNull();
    expect(typeof token).toBe('string');
  });

  it('should throw an error if credentials are invalid', async () => {
    await expect(loginUseCase.execute(INVALID_LOGIN)).rejects.toThrowError();
  });
});
