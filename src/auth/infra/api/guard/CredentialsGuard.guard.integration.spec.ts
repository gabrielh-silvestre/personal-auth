import type { ExecutionContext } from '@nestjs/common';

import type { IUserGateway } from '@auth/infra/gateway/user/user.gateway.interface';

import { CredentialsGuard } from './CredentialsGuard.guard';
import { LocalStrategy } from '@auth/infra/strategy/Local.strategy';

function buildHttpContext(request: Record<string, unknown>): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }),
  } as unknown as ExecutionContext;
}

// Same object identity for switchToHttp().getRequest() and switchToRpc().getData()
// in 'rpc' context — this is exactly what convertGrpcCredentialsToHttpBody relies on.
function buildRpcContext(data: Record<string, unknown>): ExecutionContext {
  return {
    getType: () => 'rpc',
    switchToRpc: () => ({ getData: () => data }),
    switchToHttp: () => ({ getRequest: () => data, getResponse: () => ({}) }),
  } as unknown as ExecutionContext;
}

describe('Integration test for CredentialsGuard', () => {
  let guard: CredentialsGuard;

  beforeEach(() => {
    guard = new CredentialsGuard();
  });

  it('activates for valid HTTP credentials read from the request body', async () => {
    const userGateway: IUserGateway = {
      verifyCredentials: jest.fn().mockResolvedValueOnce({ id: 'U1' }),
    };
    new LocalStrategy(userGateway);
    const request: Record<string, unknown> = {
      body: { email: 'a@b.com', password: 'pw' },
    };

    await expect(guard.canActivate(buildHttpContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({ userId: 'U1' });
  });

  it('activates for valid gRPC/RMQ credentials by copying them into the HTTP body', async () => {
    const userGateway: IUserGateway = {
      verifyCredentials: jest.fn().mockResolvedValueOnce({ id: 'U1' }),
    };
    new LocalStrategy(userGateway);
    const data: Record<string, unknown> = { email: 'a@b.com', password: 'pw' };

    await expect(guard.canActivate(buildRpcContext(data))).resolves.toBe(true);
    expect(data.body).toEqual({ email: 'a@b.com', password: 'pw' });
    expect(data.user).toEqual({ userId: 'U1' });
  });

  it('rejects invalid credentials', async () => {
    const userGateway: IUserGateway = {
      verifyCredentials: jest.fn().mockRejectedValueOnce(new Error('invalid')),
    };
    new LocalStrategy(userGateway);
    const request: Record<string, unknown> = {
      body: { email: 'a@b.com', password: 'wrong' },
    };

    await expect(guard.canActivate(buildHttpContext(request))).rejects.toThrow();
  });
});
