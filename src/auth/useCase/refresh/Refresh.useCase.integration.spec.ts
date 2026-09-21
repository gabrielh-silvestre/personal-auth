import type { ITokenRepository } from '#auth/domain/repository/token.repository.interface';
import type { IDatabaseAdapter } from '#auth/infra/adapter/database/database.adapter.interface';

import { RefreshUseCase } from '#auth/useCase/refresh/Refresh.useCase';

import { DatabaseGateway } from '#auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '#auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '#shared/utils/mocks/tokens.mock';

const [, , { userId: accessId }, { userId }] = TOKENS_MOCK;

describe('Integration test for Refresh use case', () => {
  let refreshUseCase: RefreshUseCase;
  let databaseGateway: ITokenRepository;
  let databaseAdapter: IDatabaseAdapter;

  beforeEach(() => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new DatabaseMemoryAdapter();
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
    ).rejects.toThrow('Invalid token');
  });

  it('should throw an error when the token is invalid', async () => {
    await expect(refreshUseCase.execute({ userId: accessId })).rejects.toThrow(
      'Invalid token',
    );
  });
});
