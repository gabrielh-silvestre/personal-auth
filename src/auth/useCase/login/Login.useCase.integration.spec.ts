import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';
import type { IDatabaseAdapter } from '@auth/infra/adapter/database/Database.adapter.interface';

import { LoginUseCase } from './Login.useCase';

import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [{ userId }] = TOKENS_MOCK;

describe('Integration test for Login use case', () => {
  let loginUseCase: LoginUseCase;
  let databaseGateway: IDatabaseGateway;
  let databaseAdapter: IDatabaseAdapter;

  beforeEach(() => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new DatabaseMemoryAdapter();
    databaseGateway = new DatabaseGateway(databaseAdapter);
    loginUseCase = new LoginUseCase(databaseGateway);
  });

  it('should login with success', async () => {
    const token = await loginUseCase.execute({ userId });

    expect(token).not.toBeNull();
    expect(token).toStrictEqual({
      accessTokenId: expect.any(String),
      refreshTokenId: expect.any(String),
      userId: expect.any(String),
    });
  });
});
