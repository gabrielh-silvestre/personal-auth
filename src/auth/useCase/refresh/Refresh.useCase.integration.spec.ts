import { ConfigService } from '@nestjs/config';

import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';
import type { IDatabaseAdapter } from '@auth/infra/adapter/database/Database.adapter.interface';

import { RefreshUseCase } from './Refresh.useCase';

import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [, , { userId: accessId }, { userId }] = TOKENS_MOCK;

const tokenFactory = new TokenFactory(
  new ConfigService({
    ACCESS_TOKEN_EXPIRE_TIME: '86400000',
    REFRESH_TOKEN_EXPIRE_TIME: '604800000',
  }),
);

describe('Integration test for Refresh use case', () => {
  let refreshUseCase: RefreshUseCase;
  let databaseGateway: IDatabaseGateway;
  let databaseAdapter: IDatabaseAdapter;

  beforeEach(() => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new DatabaseMemoryAdapter();
    databaseGateway = new DatabaseGateway(databaseAdapter);
    refreshUseCase = new RefreshUseCase(databaseGateway, tokenFactory);
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
    await expect(
      refreshUseCase.execute({ userId: accessId }),
    ).rejects.toThrow('Invalid token');
  });
});
