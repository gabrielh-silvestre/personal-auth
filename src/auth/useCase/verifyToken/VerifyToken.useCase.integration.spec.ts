import { v4 as uuid } from 'uuid';

import type { ITokenRepository } from '#auth/domain/repository/token.repository.interface';
import type { IDatabaseAdapter } from '#auth/infra/adapter/database/database.adapter.interface';

import { VerifyTokenUseCase } from '#auth/useCase/verifyToken/VerifyToken.useCase';

import { Token } from '#auth/domain/entity/Token';
import { DatabaseGateway } from '#auth/infra/gateway/database/Database.gateway';
import { DatabaseMemoryAdapter } from '#auth/infra/adapter/database/memory/DatabaseMemory.adapter';

import { TOKENS_MOCK } from '#shared/utils/mocks/tokens.mock';

const [TOKEN] = TOKENS_MOCK;
const { id: tokenId } = TOKEN;

describe('Integration test for VerifyToken use case', () => {
  let verifyTokenUseCase: VerifyTokenUseCase;
  let databaseGateway: ITokenRepository;
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
    ).rejects.toThrow('Invalid token');
  });

  it('should throw an exception when token is revoked', async () => {
    const revokedToken = new Token(
      uuid(),
      TOKEN.userId,
      TOKEN.expireTime,
      new Date(),
      true,
      'ACCESS',
    );
    await databaseAdapter.create(revokedToken);

    await expect(
      verifyTokenUseCase.execute({ tokenId: revokedToken.id }),
    ).rejects.toThrow('Invalid token');
  });

  it('should throw an exception when token is expired', async () => {
    const expiredToken = new Token(
      uuid(),
      TOKEN.userId,
      -1000,
      new Date(),
      false,
      'ACCESS',
    );
    await databaseAdapter.create(expiredToken);

    await expect(
      verifyTokenUseCase.execute({ tokenId: expiredToken.id }),
    ).rejects.toThrow('Invalid token');
  });
});
