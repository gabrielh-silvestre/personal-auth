import { Test } from '@nestjs/testing';

import { RefreshTokenUseCase } from './RefreshToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [, , , token] = TOKENS_MOCK;

describe('Integration tests for Refresh Token use case', () => {
  let refreshTokenUseCase: RefreshTokenUseCase;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
      ],
    }).compile();

    refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  it('should refresh a token with success', async () => {
    const tokenData = await refreshTokenUseCase.execute(token.id);

    expect(tokenData).not.toBeNull();
    expect(tokenData).toStrictEqual({
      tokenId: expect.any(String),
      userId: expect.any(String),
    });
  });

  it('should throw an error if token is invalid', async () => {
    await expect(refreshTokenUseCase.execute('invalid token')).rejects.toThrow(
      'Invalid token',
    );
  });

  it('should throw an error if token is already revoked', async () => {
    token.revoke();
    await expect(refreshTokenUseCase.execute(token.id)).rejects.toThrow(
      'Invalid token',
    );
  });
});
