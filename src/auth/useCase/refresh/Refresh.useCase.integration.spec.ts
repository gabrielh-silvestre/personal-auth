import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';
import type { IDatabaseAdapter } from '@auth/infra/adapter/database/Database.adapter.interface';

import { RefreshUseCase } from './Refresh.useCase';

import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Integration test for Refresh use case', () => {
  let refreshUseCase: RefreshUseCase;
  let databaseGateway: IDatabaseGateway;
  let databaseAdapter: IDatabaseAdapter;

  beforeEach(() => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new DatabaseMemoryAdapter();
    databaseGateway = new DatabaseGateway(databaseAdapter);
    refreshUseCase = new RefreshUseCase(databaseGateway);
  });

  it('should refresh with success', async () => {
    const token = await refreshUseCase.execute({ userId: 'fake-user-id' });

    expect(token).not.toBeNull();
    expect(token).toStrictEqual({
      accessTokenId: expect.any(String),
      refreshTokenId: expect.any(String),
      userId: expect.any(String),
    });
  });
});
