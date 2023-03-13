import type { IToken } from '@auth/domain/entity/token.interface';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';
import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';

import { GenerateTokenUseCase } from './GenerateToken.useCase';

import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { OrmMemoryAdapter } from '@auth/infra/adapter/orm/memory/OrmMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Integration test for GenerateToken use case', () => {
  let generateTokenUseCase: GenerateTokenUseCase;
  let databaseGateway: IDatabaseGateway;
  let databaseAdapter: IOrmAdapter<IToken>;

  beforeEach(() => {
    OrmMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new OrmMemoryAdapter();
    databaseGateway = new DatabaseGateway(databaseAdapter);
    generateTokenUseCase = new GenerateTokenUseCase(databaseGateway);
  });

  it('should generate token with success', async () => {
    const token = await generateTokenUseCase.execute({
      userId: '1',
      type: 'recover',
    });

    expect(token).not.toBeNull();
    expect(token).toStrictEqual(expect.any(String));
  });

  it('should throw an exception when token type is invalid', async () => {
    await expect(
      generateTokenUseCase.execute({ userId: '1', type: 'invalid' as any }),
    ).rejects.toThrowError('Invalid token type');
  });
});
