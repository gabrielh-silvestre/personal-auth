import type { ExecutionContext } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RefreshTokenGuard } from './RefreshToken.guard';
import { JwtRefreshTokenStrategy } from '@auth/infra/strategy/Jwt.refresh-token.strategy';

const SECRET = 'refresh-test-secret';

function buildHttpContext(request: Record<string, unknown>): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }),
  } as unknown as ExecutionContext;
}

// Same object identity for switchToHttp().getRequest() and switchToRpc().getData()
// in 'rpc' context — see CredentialsGuard.guard.ts.
function buildRpcContext(message: Record<string, unknown>): ExecutionContext {
  return {
    getType: () => 'rpc',
    switchToRpc: () => ({ getData: () => message }),
    switchToHttp: () => ({ getRequest: () => message, getResponse: () => ({}) }),
  } as unknown as ExecutionContext;
}

describe('Integration test for RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    new JwtRefreshTokenStrategy(new ConfigService({ JWT_REFRESH_TOKEN_SECRET: SECRET }));
    guard = new RefreshTokenGuard();
    jwtService = new JwtService();
  });

  it('activates for a refresh token sent in the Refresh cookie', async () => {
    const token = await jwtService.signAsync({ tokenId: 'T1', userId: 'U1' }, { secret: SECRET });
    const request: Record<string, unknown> = { cookies: { Refresh: token } };

    await expect(guard.canActivate(buildHttpContext(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ tokenId: 'T1', userId: 'U1' });
  });

  it('activates for a refresh token sent as the RMQ message token', async () => {
    const token = await jwtService.signAsync({ tokenId: 'T1', userId: 'U1' }, { secret: SECRET });
    const message: Record<string, unknown> = { token };

    await expect(guard.canActivate(buildRpcContext(message))).resolves.toBe(true);
    expect(message.user).toMatchObject({ tokenId: 'T1', userId: 'U1' });
  });

  it('rejects a refresh token signed with a different secret', async () => {
    const token = await jwtService.signAsync(
      { tokenId: 'T1', userId: 'U1' },
      { secret: 'wrong-secret' },
    );
    const request: Record<string, unknown> = { cookies: { Refresh: token } };

    await expect(guard.canActivate(buildHttpContext(request))).rejects.toThrow();
  });
});
