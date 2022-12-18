import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';
import type { IDatabaseAdapter } from '@auth/infra/adapter/database/Database.adapter.interface';

import { VerifyTokenUseCase } from './VerifyToken.useCase';

import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

const [TOKEN] = TOKENS_MOCK;
const { id: tokenId } = TOKEN;

describe('Integration test for VerifyToken use case', () => {
  let verifyTokenUseCase: VerifyTokenUseCase;
  let databaseGateway: IDatabaseGateway;
  let databaseAdapter: IDatabaseAdapter;

  beforeEach(() => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    databaseAdapter = new DatabaseMemoryAdapter();
    databaseGateway = new DatabaseGateway(databaseAdapter);
    verifyTokenUseCase = new VerifyTokenUseCase(databaseGateway);
  });

  it('should verify with success', async () => {
    const result = await verifyTokenUseCase.execute({ tokenId });

    expect(result).not.toBeNull();
    expect(result).toStrictEqual({
      userId: expect.any(String),
    });
  });

  it('should throw an exception when token does not exist', async () => {
    await expect(
      verifyTokenUseCase.execute({ tokenId: 'invalid' }),
    ).rejects.toThrowError('Invalid token');
  });

  it('should throw an exception when token is expired', async () => {
    TOKEN.revoke();

    await expect(verifyTokenUseCase.execute({ tokenId })).rejects.toThrowError(
      'Invalid token',
    );
  });
});
