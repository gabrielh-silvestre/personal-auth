import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { RevokeTokenController } from './RevokeToken.controller';
import { RevokeTokenUseCase } from '@tokens/useCase/revoke/RevokeToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';

describe('Integration test for Revoke Token controller', () => {
  let tokenController: RevokeTokenController;
  let jwtService: JwtService;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      imports: [JwtModule.register(JWT_OPTIONS_MOCK)],
      controllers: [RevokeTokenController],
      providers: [
        RevokeTokenUseCase,
        {
          provide: 'TOKEN_REPO',
          useClass: TokenInMemoryRepository,
        },
      ],
    }).compile();

    tokenController = module.get<RevokeTokenController>(RevokeTokenController);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should revoke token with success', async () => {
    const [{ id }] = TOKENS_MOCK;
    const jwtToken = await jwtService.signAsync({ tokenId: id });

    const response = await tokenController.handle({ token: jwtToken });

    expect(response).toEqual({ success: true });
  });

  it('should inform if token cannot be revoked', async () => {
    const response = await tokenController.handle({ token: 'invalid token' });

    expect(response).toEqual({ success: false });
  });
});
