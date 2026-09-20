import type { ExecutionContext } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { AuthenticateGuard } from '#auth/infra/api/guard/Authenticate.guard';
import { JwtAccessTokenStrategy } from '#auth/infra/strategy/Jwt.access-token.strategy';

import { JwtAccessService } from '#shared/modules/jwt/JwtAccess.service';

// Mirrors the real auth.verify_token/auth.revoke_token RMQ message: the guard
// reads and writes context.switchToHttp().getRequest(), which for an RMQ handler
// is the exact object the controller later receives via @Payload().
function createRmqContext(message: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => message,
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

describe('Integration test for AuthenticateGuard', () => {
  let guard: AuthenticateGuard;
  let jwtAccessService: JwtAccessService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthenticateGuard,
        JwtAccessTokenStrategy,
        JwtAccessService,
        JwtService,
        {
          provide: ConfigService,
          useValue: new ConfigService({ NODE_ENV: 'test' }),
        },
      ],
    }).compile();

    guard = module.get(AuthenticateGuard);
    jwtAccessService = module.get(JwtAccessService);
  });

  it('activates and attaches the payload when the message carries a valid access token', async () => {
    const token = await jwtAccessService.sign({
      tokenId: 'token-1',
      userId: 'user-1',
    });
    const message: Record<string, unknown> = { token };

    await expect(guard.canActivate(createRmqContext(message))).resolves.toBe(
      true,
    );
    expect(message.user).toEqual(
      expect.objectContaining({ tokenId: 'token-1', userId: 'user-1' }),
    );
  });

  it('rejects the message when the token fails JWT verification', async () => {
    // Not `{}`: the strategy's extractor chain falls through to
    // ExtractJwt.fromAuthHeaderAsBearerToken(), which dereferences
    // req.headers and throws on a headerless RMQ message — a crash, not the
    // rejection this guard exists to prove. A short-circuiting garbage
    // `token` exercises the real invalid-signature path instead.
    const message: Record<string, unknown> = { token: 'not-a-real-jwt' };

    await expect(
      guard.canActivate(createRmqContext(message)),
    ).rejects.toThrow();
  });
});
