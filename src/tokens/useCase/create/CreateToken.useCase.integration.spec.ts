import { Test } from '@nestjs/testing';

import { CreateTokenUseCase } from './CreateToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Integration tests for Create Token use case', () => {
  let tokenUseCase: CreateTokenUseCase;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        CreateTokenUseCase,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
      ],
    }).compile();

    tokenUseCase = module.get<CreateTokenUseCase>(CreateTokenUseCase);
  });

  it('should create a access token with success', async () => {
    const newToken = await tokenUseCase.execute('1', 'ACCESS');

    expect(newToken).not.toBeNull();

    expect(newToken.id).not.toBeNull();
    expect(newToken.userId).toBe('1');
    expect(newToken.type).toBe('ACCESS');
  });

  it('should create a recover password token with success', async () => {
    const newToken = await tokenUseCase.execute('1', 'RECOVER_PASSWORD');

    expect(newToken).not.toBeNull();

    expect(newToken.id).not.toBeNull();
    expect(newToken.userId).toBe('1');
    expect(newToken.type).toBe('RECOVER_PASSWORD');
  });
});
