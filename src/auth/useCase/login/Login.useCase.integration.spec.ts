import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

import { LoginUseCase } from './Login.useCase';

import { PasswordFactory } from '@users/domain/factory/Password.factory';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { USERS_MOCK } from '@shared/utils/mocks/users.mock';
import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';

const VALID_LOGIN = {
  email: USERS_MOCK[0].email,
  password: 'password',
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
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            generateToken: jest.fn().mockResolvedValue('token'),
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

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should login with success', async () => {
    const token = await loginUseCase.execute(VALID_LOGIN);

    expect(token).not.toBeNull();
    expect(typeof token).toBe('string');
  });
});
