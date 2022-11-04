import type { Request } from 'express';
import { Test } from '@nestjs/testing';

import { RevokeTokenController } from './RevokeToken.controller';
import { RevokeTokenUseCase } from '@tokens/useCase/revoke/RevokeToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Integration test for Revoke Token controller', () => {
  let tokenController: RevokeTokenController;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
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
  });

  it('should revoke token with success', async () => {
    const [{ id }] = TOKENS_MOCK;

    const response = await tokenController.handle({
      user: { tokenId: id },
    } as Request);

    expect(response).toEqual({ success: true });
  });

  it('should inform if token cannot be revoked', async () => {
    const response = await tokenController.handle({
      user: { tokenId: 'invalid' },
    } as Request);

    expect(response).toEqual({ success: false });
  });
});
