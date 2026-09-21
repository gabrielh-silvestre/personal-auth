import type { ITokenRepository } from '#auth/domain/repository/token.repository.interface';
import type { IDatabaseAdapter } from '#auth/infra/adapter/database/database.adapter.interface';

import { RevokeTokenUseCase } from '#auth/useCase/revokeToken/RevokeToken.useCase';

import { DatabaseGateway } from '#auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '#auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '#shared/utils/mocks/tokens.mock';

const [TOKEN] = TOKENS_MOCK;
const { id: tokenId } = TOKEN;

describe('Integration test for RevokeToken use case', () => {
  let revokeTokenUseCase: RevokeTokenUseCase;
  let databaseGateway: ITokenRepository;
  let databaseAdapter: IDatabaseAdapter;

  beforeEach(() => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new DatabaseMemoryAdapter();
    databaseGateway = new DatabaseGateway(databaseAdapter);
    revokeTokenUseCase = new RevokeTokenUseCase(databaseGateway);
  });

  it('should revoke with success', async () => {
    const result = await revokeTokenUseCase.execute({ tokenId });

    expect(result).toStrictEqual({ revoked: true });

    const revokedToken = await databaseGateway.find(tokenId);
    expect(revokedToken?.isValid()).toBe(false);
  });

  it('should throw an exception when token does not exist', async () => {
    await expect(
      revokeTokenUseCase.execute({ tokenId: 'invalid' }),
    ).rejects.toThrow('Token not found');
  });
});
