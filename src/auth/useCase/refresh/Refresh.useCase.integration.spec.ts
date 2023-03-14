import type { IToken } from '@auth/domain/entity/token.interface';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';
import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';

import { RefreshUseCase } from './Refresh.useCase';

import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { OrmMemoryAdapter } from '@auth/infra/adapter/orm/memory/OrmMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [, , { userId: accessId }, { userId }] = TOKENS_MOCK;

describe('Integration test for Refresh use case', () => {
  let refreshUseCase: RefreshUseCase;
  let databaseGateway: IDatabaseGateway;
  let databaseAdapter: IOrmAdapter<IToken>;

  beforeEach(() => {
    OrmMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new OrmMemoryAdapter();
    databaseGateway = new DatabaseGateway(databaseAdapter);
    refreshUseCase = new RefreshUseCase(databaseGateway);
  });

  it('should refresh with success', async () => {
    const token = await refreshUseCase.execute({ userId });

    expect(token).not.toBeNull();
    expect(token).toStrictEqual({
      accessTokenId: expect.any(String),
      refreshTokenId: expect.any(String),
      userId: expect.any(String),
    });
  });

  it('should throw an error when the token does not exist', async () => {
    await expect(
      refreshUseCase.execute({ userId: 'invalid-user-id' }),
    ).rejects.toThrowError('Invalid token');
  });

  it('should throw an error when the token is invalid', async () => {
    await expect(
      refreshUseCase.execute({ userId: accessId }),
    ).rejects.toThrowError('Invalid token');
  });
});
