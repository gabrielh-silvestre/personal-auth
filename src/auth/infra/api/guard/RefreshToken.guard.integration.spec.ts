import type { ExecutionContext } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { RefreshTokenGuard } from '#auth/infra/api/guard/RefreshToken.guard';
import { JwtRefreshTokenStrategy } from '#auth/infra/strategy/Jwt.refresh-token.strategy';

import { JwtRefreshService } from '#shared/modules/jwt/JwtRefresh.service';

// Mirrors the real GET /auth/refresh request: the guard reads req.cookies.Refresh
// and, on success, attaches `user` to the same request object the controller
// later reads via @Request().
function createHttpContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

describe('Integration test for RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;
  let jwtRefreshService: JwtRefreshService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RefreshTokenGuard,
        JwtRefreshTokenStrategy,
        JwtRefreshService,
        JwtService,
        {
          provide: ConfigService,
          useValue: new ConfigService({ NODE_ENV: 'test' }),
        },
      ],
    }).compile();

    guard = module.get(RefreshTokenGuard);
    jwtRefreshService = module.get(JwtRefreshService);
  });

  it('activates and attaches the payload when the Refresh cookie carries a valid refresh token', async () => {
    const token = await jwtRefreshService.sign({
      tokenId: 'token-1',
      userId: 'user-1',
    });
    const request: Record<string, unknown> = { cookies: { Refresh: token } };

    await expect(guard.canActivate(createHttpContext(request))).resolves.toBe(
      true,
    );
    expect(request.user).toEqual(
      expect.objectContaining({ tokenId: 'token-1', userId: 'user-1' }),
    );
  });

  it('rejects the request when the Refresh cookie is missing', async () => {
    const request: Record<string, unknown> = { cookies: {} };

    await expect(
      guard.canActivate(createHttpContext(request)),
    ).rejects.toThrow();
  });
});
