import { v4 as uuid } from 'uuid';

import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { DatabaseMemoryAdapter } from './DatabaseMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Unit test infra in memory Task repository', () => {
  beforeEach(() => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);
  });

  it('should find all tokens', async () => {
    const tokenRepository = new DatabaseMemoryAdapter();

    const foundTokens = await tokenRepository.findAll();

    expect(foundTokens).toBeInstanceOf(Array);
    expect(foundTokens).toHaveLength(TOKENS_MOCK.length);
  });

  it('should find a token by id', async () => {
    const tokenRepository = new DatabaseMemoryAdapter();
    const [tokenToFind] = TOKENS_MOCK;

    const foundToken = await tokenRepository.findOne({ id: tokenToFind.id });

    expect(foundToken).not.toBeNull();
  });

  it('should create a access token', async () => {
    const tokenRepository = new DatabaseMemoryAdapter();
    const newToken = TokenFactory.createAccessToken(uuid());

    await tokenRepository.create(newToken);

    const foundToken = await tokenRepository.findOne({ id: newToken.id });

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(newToken.userId);

    expect(foundToken?.isValid()).toBeTruthy();
    expect(foundToken?.type).toBe('ACCESS');
  });

  it('should create a recover password token', async () => {
    const tokenRepository = new DatabaseMemoryAdapter();
    const newToken = TokenFactory.createRecoverPasswordToken(uuid());

    await tokenRepository.create(newToken);

    const foundToken = await tokenRepository.findOne({ id: newToken.id });

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(newToken.userId);

    expect(foundToken?.isValid()).toBeTruthy();
    expect(foundToken?.type).toBe('RECOVER_PASSWORD');
  });

  it('should update a token or create a new one if not found', async () => {
    const tokenRepository = new DatabaseMemoryAdapter();
    const [tokenToUpdate] = TOKENS_MOCK;

    tokenToUpdate.revoke();

    await tokenRepository.update(tokenToUpdate);

    const foundToken = await tokenRepository.findOne({ id: tokenToUpdate.id });

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(tokenToUpdate.userId);

    expect(foundToken?.isValid()).toBeFalsy();

    const newToken = TokenFactory.createAccessToken(uuid());

    await tokenRepository.update(newToken);

    const foundNewToken = await tokenRepository.findOne({ id: newToken.id });

    expect(foundNewToken).not.toBeNull();
    expect(foundNewToken?.id).toBeDefined();
    expect(foundNewToken?.userId).toBe(newToken.userId);
  });

  it('should find a token by user id and type', async () => {
    const tokenRepository = new DatabaseMemoryAdapter();
    const [tokenToFind] = TOKENS_MOCK;

    const foundToken = await tokenRepository.findOne({
      id: tokenToFind.id,
      type: tokenToFind.type,
    });

    expect(foundToken).not.toBeNull();
  });
});
