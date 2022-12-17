import type { ITokenAdapter } from '@auth/infra/adapter/token/Token.adapter.interface';
import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';

import { GenerateTokenUseCase } from './GenerateToken.useCase';

import { TokenGateway } from '@auth/infra/gateway/token/Token.gateway';

describe('Integration test for GenerateToken use case', () => {
  let generateTokenUseCase: GenerateTokenUseCase;
  let tokenGateway: ITokenGateway;
  const tokenAdapter: ITokenAdapter = {
    generate: jest.fn().mockReturnValue('fake-token-id'),
    verify: jest.fn(),
  };

  beforeEach(() => {
    tokenGateway = new TokenGateway(tokenAdapter);
    generateTokenUseCase = new GenerateTokenUseCase(tokenGateway);
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
