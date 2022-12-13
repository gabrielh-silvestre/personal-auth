import type { ITokenAdapter } from '@auth/infra/adapter/token/Token.adapter.interface';
import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';

import { RefreshUseCase } from './Refresh.useCase';

import { TokenGateway } from '@auth/infra/gateway/token/Token.gateway';

const TOKEN_PAYLOAD = {
  userId: 'fake-user-id',
  tokenId: 'fake-token-id',
};

describe('Integration test for Refresh use case', () => {
  let refreshUseCase: RefreshUseCase;
  let tokenGateway: ITokenGateway;
  const tokenAdapter: ITokenAdapter = {
    generate: jest.fn().mockReturnValue('fake-token-id'),
    verify: jest.fn().mockReturnValue(TOKEN_PAYLOAD),
  };

  beforeEach(() => {
    tokenGateway = new TokenGateway(tokenAdapter);
    refreshUseCase = new RefreshUseCase(tokenGateway);
  });

  it('should refresh with success', async () => {
    const token = await refreshUseCase.execute({ userId: 'fake-user-id' });

    expect(token).not.toBeNull();
    expect(token).toStrictEqual({
      accessTokenId: expect.any(String),
      refreshTokenId: expect.any(String),
      userId: expect.any(String),
    });
  });
});
