import type { ExecutionContext } from '@nestjs/common';

import { Test } from '@nestjs/testing';

import type { IUserGateway } from '#auth/infra/gateway/user/user.gateway.interface';

import { CredentialsGuard } from '#auth/infra/api/guard/CredentialsGuard.guard';
import { LocalStrategy } from '#auth/infra/strategy/Local.strategy';

import { USER_GATEWAY } from '#auth/utils/constants/index';

const VALID_EMAIL = 'user@test.com';
const VALID_PASSWORD = 'secret';

const userGateway: IUserGateway = {
  verifyCredentials: async (email, password) => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      return { id: 'user-1' };
    }

    throw new Error('Invalid credentials');
  },
};

// Mirrors the real gRPC LoginUser call: in an 'rpc' ExecutionContext,
// switchToHttp().getRequest() and switchToRpc().getData() resolve to the same
// object (context.getArgs()[0]) — the guard's convertRpcCredentialsToHttpBody
// relies on that to move the gRPC payload into the shape passport-local expects.
// Handing out two different objects here would let the guard authenticate
// against a body no one ever set, passing (or failing) for the wrong reason.
function createGrpcContext(payload: Record<string, unknown>): ExecutionContext {
  return {
    getType: () => 'rpc',
    switchToHttp: () => ({
      getRequest: () => payload,
      getResponse: () => ({}),
    }),
    switchToRpc: () => ({ getData: () => payload }),
  } as unknown as ExecutionContext;
}

describe('Integration test for CredentialsGuard', () => {
  let guard: CredentialsGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CredentialsGuard,
        LocalStrategy,
        { provide: USER_GATEWAY, useValue: userGateway },
      ],
    }).compile();

    guard = module.get(CredentialsGuard);
  });

  it('activates and attaches the user when the gRPC payload carries valid credentials', async () => {
    const payload: Record<string, unknown> = {
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
    };

    await expect(guard.canActivate(createGrpcContext(payload))).resolves.toBe(
      true,
    );
    expect(payload.user).toStrictEqual({ userId: 'user-1' });
  });

  it('rejects the gRPC payload when the credentials are wrong', async () => {
    const payload: Record<string, unknown> = {
      email: VALID_EMAIL,
      password: 'wrong-password',
    };

    await expect(
      guard.canActivate(createGrpcContext(payload)),
    ).rejects.toThrow();
  });
});
