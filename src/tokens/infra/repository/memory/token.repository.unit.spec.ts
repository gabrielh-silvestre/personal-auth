import { v4 as uuid } from 'uuid';

import { TokenType } from '@tokens/domain/entity/token.interface';
import { TokenFactory } from '@tokens/domain/factory/Token.factory';

import { TokenInMemoryRepository } from './Token.repository';
import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Unit test infra in memory Task repository', () => {
  beforeEach(() => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);
  });

  it('should create a access token', async () => {
    const tokenRepository = new TokenInMemoryRepository();
    const newToken = TokenFactory.createAccessToken(uuid());

    await tokenRepository.create(newToken);

    const foundToken = await tokenRepository.find(newToken.id);

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(newToken.userId);

    expect(foundToken?.isValid()).toBeTruthy();
    expect(foundToken?.type).toBe(TokenType.ACCESS);
  });

  it('should create a recover password token', async () => {
    const tokenRepository = new TokenInMemoryRepository();
    const newToken = TokenFactory.createRecoverPasswordToken(uuid());

    await tokenRepository.create(newToken);

    const foundToken = await tokenRepository.find(newToken.id);

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(newToken.userId);

    expect(foundToken?.isValid()).toBeTruthy();
    expect(foundToken?.type).toBe(TokenType.RECOVER_PASSWORD);
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

    const newToken = TokenFactory.createAccessToken(uuid());

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

    const foundToken = await tokenRepository.findByUserId(tokenToFind.userId);

    expect(foundToken).not.toBeNull();
    expect(foundToken).toBeInstanceOf(Array);
  });
});
