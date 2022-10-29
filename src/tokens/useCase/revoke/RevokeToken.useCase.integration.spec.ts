import { Test } from '@nestjs/testing';

import { RevokeTokenUseCase } from './RevokeToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [token] = TOKENS_MOCK;

describe('Integration tests for Revoke Token use case', () => {
  let tokenUseCase: RevokeTokenUseCase;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        RevokeTokenUseCase,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
      ],
    }).compile();

    tokenUseCase = module.get<RevokeTokenUseCase>(RevokeTokenUseCase);
  });

  it('should revoke a token with success', async () => {
    await expect(tokenUseCase.execute(token.id)).resolves.not.toThrow();
  });

  it('should throw an error if token is invalid', async () => {
    await expect(tokenUseCase.execute('invalid token')).rejects.toThrow();
  });

  it('should throw an error if token is already revoked', async () => {
    token.revoke();
    await expect(tokenUseCase.execute(token.id)).rejects.toThrow(
      'Invalid token',
    );
  });
});
