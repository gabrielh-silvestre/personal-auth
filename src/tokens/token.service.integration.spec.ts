import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { TokenService } from './token.service';
import { TokenInMemoryRepository } from './infra/repository/memory/Token.repository';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';

describe('Integration test for Token service', () => {
  let tokenService: TokenService;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
          verifyOptions: { maxAge: '1m' },
          signOptions: { expiresIn: '1m' },
        }),
      ],
      providers: [
        TokenService,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
  });

  describe('createToken', () => {
    it('should create a token', async () => {
      const newToken = await tokenService.createToken({ userId: '1' });

      expect(newToken).not.toBeNull();
      expect(typeof newToken.token).toBe('string');
    });
  });

  describe('validateToken', () => {
    it('should validate a token', async () => {
      const newToken = await tokenService.createToken({ userId: '1' });

      const isTokenValid = await tokenService.validateToken(newToken.token);

      expect(isTokenValid).toBe(true);
    });

    // TODO: create invalid jwt token
    // it('should not validate a token', async () => {
    //   const isTokenValid = await tokenService.validateToken('invalid');

    //   expect(isTokenValid).toBe(false);
    // });
  });

  describe('recover token payload', () => {
    it('should recover a token payload', async () => {
      const newToken = await tokenService.createToken({ userId: '1' });

      const tokenPayload = await tokenService.recoverTokenPayload(
        newToken.token,
      );

      expect(tokenPayload).toBeDefined();
      expect(typeof tokenPayload.userId).toBe('string');
    });
  });
});