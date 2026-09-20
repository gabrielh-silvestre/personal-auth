import type { ExecutionContext } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { VerifyTokenMessageDto } from '@auth/infra/strategy/VerifyTokenMessage.dto';

import { AuthenticateGuard } from './Authenticate.guard';
import { JwtAccessTokenStrategy } from '@auth/infra/strategy/Jwt.access-token.strategy';

const SECRET = 'access-test-secret';

type RmqMessage = VerifyTokenMessageDto & { user?: unknown };

// In 'rpc' context, switchToHttp().getRequest() and switchToRpc().getData() resolve
// to the same object — see CredentialsGuard.guard.ts. The guard reads the JWT from
// the message via switchToHttp() but the message itself only exists via switchToRpc().
function buildRpcContext(message: RmqMessage): ExecutionContext {
  return {
    getType: () => 'rpc',
    switchToRpc: () => ({ getData: () => message }),
    switchToHttp: () => ({ getRequest: () => message, getResponse: () => ({}) }),
  } as unknown as ExecutionContext;
}

describe('Integration test for AuthenticateGuard', () => {
  let guard: AuthenticateGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    new JwtAccessTokenStrategy(new ConfigService({ JWT_ACCESS_TOKEN_SECRET: SECRET }));
    guard = new AuthenticateGuard();
    jwtService = new JwtService();
  });

  it('activates for a valid access token and attaches the payload to the message', async () => {
    const token = await jwtService.signAsync({ tokenId: 'T1', userId: 'U1' }, { secret: SECRET });
    const message: RmqMessage = { token };

    await expect(guard.canActivate(buildRpcContext(message))).resolves.toBe(true);
    expect(message.user).toMatchObject({ tokenId: 'T1', userId: 'U1' });
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await jwtService.signAsync(
      { tokenId: 'T1', userId: 'U1' },
      { secret: 'wrong-secret' },
    );
    const message: RmqMessage = { token };

    await expect(guard.canActivate(buildRpcContext(message))).rejects.toThrow();
  });
});
