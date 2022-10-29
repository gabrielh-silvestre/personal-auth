import { Test } from '@nestjs/testing';

import { ValidateTokenUseCase } from './ValidateToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [token] = TOKENS_MOCK;

describe('Integration tests for Validate Token use case', () => {
  let validateTokenUseCase: ValidateTokenUseCase;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        ValidateTokenUseCase,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
      ],
    }).compile();

    validateTokenUseCase =
      module.get<ValidateTokenUseCase>(ValidateTokenUseCase);
  });

  it('should validate a token with success', async () => {
    const tokenData = await validateTokenUseCase.execute(token.id);

    expect(tokenData).not.toBeNull();
    expect(tokenData).toStrictEqual({
      tokenId: expect.any(String),
      userId: expect.any(String),
    });
  });

  it('should throw an error if token is invalid', async () => {
    await expect(validateTokenUseCase.execute('invalid token')).rejects.toThrow(
      'Invalid token',
    );
  });

  it('should throw an error if token is already revoked', async () => {
    token.revoke();
    await expect(validateTokenUseCase.execute(token.id)).rejects.toThrow(
      'Invalid token',
    );
  });
});
