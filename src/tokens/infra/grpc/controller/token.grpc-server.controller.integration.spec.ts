import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { TokenGrpcServerController } from './Token.grpc-server.controller';
import { TokenService } from '@tokens/token.service';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';

describe('Integration test for gRPC server Token controller', () => {
  let tokenController: TokenGrpcServerController;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      imports: [JwtModule.register(JWT_OPTIONS_MOCK)],
      controllers: [TokenGrpcServerController],
      providers: [
        TokenService,
        {
          provide: 'TOKEN_REPO',
          useClass: TokenInMemoryRepository,
        },
      ],
    }).compile();

    tokenController = module.get<TokenGrpcServerController>(
      TokenGrpcServerController,
    );
  });

  describe('revoke token', () => {
    it('should revoke token', async () => {
      const [token] = TOKENS_MOCK;
      const jwtToken = new JwtService(JWT_OPTIONS_MOCK).sign({
        tokenId: token.id,
        userId: token.userId,
      });

      const response = await tokenController.revokeToken({ token: jwtToken });

      expect(response).toEqual({ success: true });
    });
  });
});
