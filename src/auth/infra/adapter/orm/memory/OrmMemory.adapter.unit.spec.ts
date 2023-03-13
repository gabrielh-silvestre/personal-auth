import { v4 as uuid } from 'uuid';

import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { OrmTokenDto } from '../orm.interface';

import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { OrmMemoryAdapter } from './OrmMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Unit test infra in memory Task repository', () => {
  let ormAdapter: IOrmAdapter<OrmTokenDto>;

  beforeEach(() => {
    ormAdapter = new OrmMemoryAdapter();
    OrmMemoryAdapter.reset(TOKENS_MOCK);
  });

  it('should find all tokens', async () => {
    const foundTokens = await ormAdapter.findAll();

    expect(foundTokens).toBeInstanceOf(Array);
    expect(foundTokens).toHaveLength(TOKENS_MOCK.length);
  });

  it('should find a token by id', async () => {
    const [tokenToFind] = TOKENS_MOCK;

    const foundToken = await ormAdapter.findOne({ id: tokenToFind.id });

    expect(foundToken).not.toBeNull();
  });

  it('should create a access token', async () => {
    const newToken = TokenFactory.createAccessToken(uuid());

    await ormAdapter.create(newToken);
    const foundToken = await ormAdapter.findOne({ id: newToken.id });

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(newToken.userId);

    expect(foundToken?.type).toBe('ACCESS');
  });

  it('should create a recover password token', async () => {
    const newToken = TokenFactory.createRecoverPasswordToken(uuid());

    await ormAdapter.create(newToken);
    const foundToken = await ormAdapter.findOne({ id: newToken.id });

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(newToken.userId);

    expect(foundToken?.type).toBe('RECOVER_PASSWORD');
  });

  it('should update a token or create a new one if not found', async () => {
    const [tokenToUpdate] = TOKENS_MOCK;

    tokenToUpdate.revoke();
    await ormAdapter.update(tokenToUpdate.id, tokenToUpdate);
    const foundToken = await ormAdapter.findOne({ id: tokenToUpdate.id });

    expect(foundToken).not.toBeNull();
    expect(foundToken?.id).toBeDefined();
    expect(foundToken?.userId).toBe(tokenToUpdate.userId);

    const newToken = TokenFactory.createAccessToken(uuid());
    await ormAdapter.update(tokenToUpdate.id, newToken);
    const foundNewToken = await ormAdapter.findOne({ id: newToken.id });

    expect(foundNewToken).not.toBeNull();
    expect(foundNewToken?.id).toBeDefined();
    expect(foundNewToken?.userId).toBe(newToken.userId);
  });

  it('should find a token by user id and type', async () => {
    const [tokenToFind] = TOKENS_MOCK;

    const foundToken = await ormAdapter.findOne({
      id: tokenToFind.id,
      type: tokenToFind.type,
    });

    expect(foundToken).not.toBeNull();
  });
});
