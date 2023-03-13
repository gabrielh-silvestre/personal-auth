import type { IToken } from '@auth/domain/entity/token.interface';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';
import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';

import { LoginUseCase } from './Login.useCase';

import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { OrmMemoryAdapter } from '@auth/infra/adapter/orm/memory/OrmMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [{ userId }] = TOKENS_MOCK;

describe('Integration test for Login use case', () => {
  let loginUseCase: LoginUseCase;
  let databaseGateway: IDatabaseGateway;
  let databaseAdapter: IOrmAdapter<IToken>;

  beforeEach(() => {
    OrmMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new OrmMemoryAdapter();
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
