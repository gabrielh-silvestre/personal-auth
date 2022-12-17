import type { ITokenAdapter } from '@auth/infra/adapter/token/Token.adapter.interface';
import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';

import { VerifyTokenUseCase } from './VerifyToken.useCase';

import { TokenGateway } from '@auth/infra/gateway/token/Token.gateway';

const TOKEN_PAYLOAD = {
  userId: 'fake-user-id',
  tokenId: 'fake-token-id',
};

describe('Integration test for VerifyToken use case', () => {
  let verifyTokenUseCase: VerifyTokenUseCase;
  let tokenGateway: ITokenGateway;

  const tokenAdapter: ITokenAdapter = {
    generate: jest.fn(),
    verify: jest.fn().mockReturnValue(TOKEN_PAYLOAD),
  };

  beforeEach(() => {
    tokenGateway = new TokenGateway(tokenAdapter);
    verifyTokenUseCase = new VerifyTokenUseCase(tokenGateway);
  });

  it('should verify with success', async () => {
    const result = await verifyTokenUseCase.execute({
      tokenId: 'fake-token-id',
    });

    expect(result).not.toBeNull();
    expect(result).toStrictEqual({
      userId: expect.any(String),
    });
  });
});
