import { Test } from '@nestjs/testing';

import { LoginUseCase } from './Login.useCase';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Integration test for Login use case', () => {
  let loginUseCase: LoginUseCase;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue('token-id'),
            generateRefreshToken: jest.fn().mockResolvedValue('token-id'),
          },
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should login with success', async () => {
    const token = await loginUseCase.execute({ userId: '1' });

    expect(token).not.toBeNull();
    expect(token).toStrictEqual({
      accessTokenId: expect.any(String),
      refreshTokenId: expect.any(String),
      userId: expect.any(String),
    });
  });
});
