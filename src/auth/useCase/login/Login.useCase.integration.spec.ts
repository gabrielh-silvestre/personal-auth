import type { IToken } from '#auth/domain/entity/token.interface';
import type { ITokenRepository } from '#auth/domain/repository/token.repository.interface';
import type { IDatabaseAdapter } from '#auth/infra/adapter/database/database.adapter.interface';

import { LoginUseCase } from '#auth/useCase/login/Login.useCase';

import { Token } from '#auth/domain/entity/Token';
import { DatabaseGateway } from '#auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '#auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '#shared/utils/mocks/tokens.mock';

const [{ userId }] = TOKENS_MOCK;

/**
 * `DatabaseMemoryAdapter.create` upserts by `userId` only, so it can't
 * reproduce production's `userId + type` upsert key (see
 * `DatabaseMongooseAdapter.create`). This double models that composite key
 * so the "second login replaces the first session" rule can be asserted.
 */
class UpsertByUserIdAndTypeAdapter implements IDatabaseAdapter {
  private readonly store = new Map<string, Token>();

  private key(userId: string, type: string): string {
    return `${userId}:${type}`;
  }

  async findOne<T extends Partial<IToken>>(dto: T): Promise<Token | null> {
    const entries = Object.entries(dto) as [
      keyof IToken,
      IToken[keyof IToken],
    ][];

    const found = [...this.store.values()].find((token) =>
      entries.every(([key, value]) => token[key] === value),
    );

    return found ?? null;
  }

  async create(entity: Token): Promise<void> {
    this.store.set(this.key(entity.userId, entity.type), entity);
  }

  async update(entity: Token): Promise<void> {
    const existingKey = [...this.store.entries()].find(
      ([, token]) => token.id === entity.id,
    )?.[0];

    if (existingKey) this.store.set(existingKey, entity);
  }

  get tokens(): Token[] {
    return [...this.store.values()];
  }
}

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
    const upsertAdapter = new UpsertByUserIdAndTypeAdapter();
    const gateway = new DatabaseGateway(upsertAdapter);
    const useCase = new LoginUseCase(gateway);

    const firstLogin = await useCase.execute({ userId });
    const secondLogin = await useCase.execute({ userId });

    expect(secondLogin.accessTokenId).not.toBe(firstLogin.accessTokenId);
    expect(secondLogin.refreshTokenId).not.toBe(firstLogin.refreshTokenId);

    expect(upsertAdapter.tokens).toHaveLength(2);
    expect(upsertAdapter.tokens.map((token) => token.id)).toEqual(
      expect.arrayContaining([
        secondLogin.accessTokenId,
        secondLogin.refreshTokenId,
      ]),
    );
    expect(upsertAdapter.tokens.map((token) => token.type).sort()).toEqual([
      'ACCESS',
      'REFRESH',
    ]);
  });
});
