import { ConfigService } from '@nestjs/config';

import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';
import type { IDatabaseAdapter } from '@auth/infra/adapter/database/Database.adapter.interface';

import { LoginUseCase } from './Login.useCase';

import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { MongoLikeDatabaseAdapter } from '@shared/utils/mocks/MongoLikeDatabaseAdapter.mock';
import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [{ userId }] = TOKENS_MOCK;

const tokenFactory = new TokenFactory(
  new ConfigService({
    ACCESS_TOKEN_EXPIRE_TIME: '86400000',
    REFRESH_TOKEN_EXPIRE_TIME: '604800000',
  }),
);

describe('Integration test for Login use case', () => {
  let loginUseCase: LoginUseCase;
  let databaseGateway: IDatabaseGateway;
  let databaseAdapter: IDatabaseAdapter;

  beforeEach(() => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new DatabaseMemoryAdapter();
    databaseGateway = new DatabaseGateway(databaseAdapter);
    loginUseCase = new LoginUseCase(databaseGateway, tokenFactory);
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

  it('should replace the previous session on a new login', async () => {
    const mongoLikeAdapter = new MongoLikeDatabaseAdapter();
    const gateway = new DatabaseGateway(mongoLikeAdapter);
    const useCase = new LoginUseCase(gateway, tokenFactory);

    const firstLogin = await useCase.execute({ userId: 'same-user' });
    const secondLogin = await useCase.execute({ userId: 'same-user' });

    expect(secondLogin.accessTokenId).not.toBe(firstLogin.accessTokenId);
    expect(secondLogin.refreshTokenId).not.toBe(firstLogin.refreshTokenId);

    const access = await gateway.findByUserIdAndType('same-user', 'ACCESS');
    const refresh = await gateway.findByUserIdAndType('same-user', 'REFRESH');

    expect(access?.id).toBe(secondLogin.accessTokenId);
    expect(refresh?.id).toBe(secondLogin.refreshTokenId);
  });
});
