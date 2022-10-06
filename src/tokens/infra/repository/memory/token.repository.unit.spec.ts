import { v4 as uuid } from 'uuid';

import { TokenFactory } from '@tokens/domain/factory/Token.factory';
import { Token } from '@tokens/domain/entity/Token';

import { TokenInMemoryRepository } from './Token.repository';

const TOKENS_MOCK: Token[] = [
  TokenFactory.create(uuid()),
  TokenFactory.create(uuid()),
  TokenFactory.create(uuid()),
];

describe('Unit test infra in memory Task repository', () => {
  beforeEach(() => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);
  });

  it('should create a token', async () => {
    const tokenRepository = new TokenInMemoryRepository();
    const newToken = TokenFactory.create(uuid());

    await tokenRepository.create(newToken);

    const foundToken = await tokenRepository.find(newToken.id);

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(newToken.userId);

    expect(foundToken?.isValid()).toBeTruthy();
  });

  it('should update a token or create a new one if not found', async () => {
    const tokenRepository = new TokenInMemoryRepository();
    const [tokenToUpdate] = TOKENS_MOCK;

    tokenToUpdate.revoke();

    await tokenRepository.update(tokenToUpdate);

    const foundToken = await tokenRepository.find(tokenToUpdate.id);

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(tokenToUpdate.userId);

    expect(foundToken?.isValid()).toBeFalsy();

    const newToken = TokenFactory.create(uuid());

    await tokenRepository.update(newToken);

    const foundNewToken = await tokenRepository.find(newToken.id);

    expect(foundNewToken).not.toBeNull();
    expect(foundNewToken?.id).toBeDefined();
    expect(foundNewToken?.userId).toBe(newToken.userId);
  });

  it('should find a token by id', async () => {
    const tokenRepository = new TokenInMemoryRepository();
    const [tokenToFind] = TOKENS_MOCK;

    const foundToken = await tokenRepository.find(tokenToFind.id);

    expect(foundToken).not.toBeNull();
  });

  it('should find a token exists by userId', async () => {
    const tokenRepository = new TokenInMemoryRepository();
    const [tokenToFind] = TOKENS_MOCK;

    const foundUser = await tokenRepository.findByUserId(tokenToFind.userId);

    expect(foundUser).not.toBeNull();
  });
});
