import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { RevokeTokenUseCase } from './RevokeToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';

describe('Integration tests for Revoke Token use case', () => {
  let tokenUseCase: RevokeTokenUseCase;
  let jwtService: JwtService;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      imports: [JwtModule.register(JWT_OPTIONS_MOCK)],
      providers: [
        RevokeTokenUseCase,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
      ],
    }).compile();

    tokenUseCase = module.get<RevokeTokenUseCase>(RevokeTokenUseCase);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should revoke a token with success', async () => {
    const [{ id }] = TOKENS_MOCK;
    const newToken = await jwtService.signAsync({ tokenId: id });

    await expect(tokenUseCase.execute(newToken)).resolves.not.toThrow();
  });

  it('should throw an error if token is invalid', async () => {
    await expect(tokenUseCase.execute('invalid token')).rejects.toThrow();
  });

  it('should throw an error if token is already revoked', async () => {
    const [{ id }] = TOKENS_MOCK;
    const newToken = await jwtService.signAsync({ tokenId: id });

    await expect(tokenUseCase.execute(newToken)).rejects.toThrow(
      'Invalid token',
    );
  });
});
