import { Test } from '@nestjs/testing';

import { RefreshUseCase } from './Refresh.useCase';

import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Integration test for Refresh use case', () => {
  let refreshUseCase: RefreshUseCase;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        RefreshUseCase,
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue('token-id'),
            generateRefreshToken: jest.fn().mockResolvedValue('token-id'),
          },
        },
      ],
    }).compile();

    refreshUseCase = module.get<RefreshUseCase>(RefreshUseCase);
  });

  it('should refresh with success', async () => {
    const token = await refreshUseCase.execute({ userId: 'fake-user-id' });

    expect(token).not.toBeNull();
    expect(token).toStrictEqual({
      accessTokenId: expect.any(String),
      refreshTokenId: expect.any(String),
      userId: expect.any(String),
    });
  });
});
