import type { ITokenAdapter } from '@auth/infra/adapter/token/Token.adapter.interface';
import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';

import { LoginUseCase } from './Login.useCase';

import { TokenGateway } from '@auth/infra/gateway/token/Token.gateway';

describe('Integration test for Login use case', () => {
  let loginUseCase: LoginUseCase;
  let tokenGateway: ITokenGateway;
  const tokenAdapter: ITokenAdapter = {
    generate: jest.fn().mockReturnValue('fake-token-id'),
    verify: jest.fn(),
  };

  beforeEach(() => {
    tokenGateway = new TokenGateway(tokenAdapter);
    loginUseCase = new LoginUseCase(tokenGateway);
  });

  it('should login with success', async () => {
    const token = await loginUseCase.execute({ userId: '1' });

    expect(token).not.toBeNull();
    expect(token).toStrictEqual({
      accessTokenId: expect.any(String),
      refreshTokenId: expect.any(String),
      userId: expect.any(String),
    });
  });
});
