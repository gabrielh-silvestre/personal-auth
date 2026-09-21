import type { ITokenRepository } from '#auth/domain/repository/token.repository.interface';
import type { IDatabaseAdapter } from '#auth/infra/adapter/database/database.adapter.interface';

import { LoginUseCase } from '#auth/useCase/login/Login.useCase';

import { DatabaseGateway } from '#auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '#auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '#shared/utils/mocks/tokens.mock';

const [{ userId }] = TOKENS_MOCK;

describe('Integration test for Login use case', () => {
  let loginUseCase: LoginUseCase;
  let databaseGateway: ITokenRepository;
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

  it('should replace the previous session tokens on a second login for the same user', async () => {
    const firstLogin = await loginUseCase.execute({ userId });
    const secondLogin = await loginUseCase.execute({ userId });

    expect(secondLogin.accessTokenId).not.toBe(firstLogin.accessTokenId);
    expect(secondLogin.refreshTokenId).not.toBe(firstLogin.refreshTokenId);

    const accessToken = await databaseAdapter.findOne({
      userId,
      type: 'ACCESS',
    });
    const refreshToken = await databaseAdapter.findOne({
      userId,
      type: 'REFRESH',
    });

    expect(accessToken?.id).toBe(secondLogin.accessTokenId);
    expect(refreshToken?.id).toBe(secondLogin.refreshTokenId);
  });
});
