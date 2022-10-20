import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { ValidateTokenUseCase } from './ValidateToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';

describe('Integration tests for Validate Token use case', () => {
  let tokenUseCase: ValidateTokenUseCase;
  let jwtService: JwtService;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      imports: [JwtModule.register(JWT_OPTIONS_MOCK)],
      providers: [
        ValidateTokenUseCase,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
      ],
    }).compile();

    tokenUseCase = module.get<ValidateTokenUseCase>(ValidateTokenUseCase);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should validate a token with success', async () => {
    const [{ id }] = TOKENS_MOCK;
    const newToken = await jwtService.signAsync({ tokenId: id });
    const tokenData = await tokenUseCase.execute(newToken);

    expect(tokenData).not.toBeNull();
    expect(tokenData).toStrictEqual({
      tokenId: expect.any(String),
      userId: expect.any(String),
    });
  });

  it('should throw an error if token is invalid', async () => {
    await expect(tokenUseCase.execute('invalid token')).rejects.toThrow();
  });

  it('should throw an error if token is already revoked', async () => {
    const [{ id }] = TOKENS_MOCK;
    const newToken = await jwtService.signAsync({ tokenId: id });

    TOKENS_MOCK[0].revoke();

    await expect(tokenUseCase.execute(newToken)).rejects.toThrow(
      'Invalid token',
    );
  });
});
