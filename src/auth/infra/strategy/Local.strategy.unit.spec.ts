import type { IUserGateway } from '#auth/infra/gateway/user/user.gateway.interface';
import { LocalStrategy } from '#auth/infra/strategy/Local.strategy';

import { ExceptionFactory } from '#exceptions/factory/Exception.factory';

function fakeUserGateway(
  verifyCredentials: IUserGateway['verifyCredentials'],
): IUserGateway {
  return { verifyCredentials };
}

describe('Unit test LocalStrategy', () => {
  it('should return the userId when credentials are valid', async () => {
    const strategy = new LocalStrategy(
      fakeUserGateway(() => Promise.resolve({ id: 'user-id' })),
    );

    const result = await strategy.validate('user@mail.com', 'secret');

    expect(result).toEqual({ userId: 'user-id' });
  });

  it('should reject with forbidden when the user service rejects the credentials', async () => {
    const strategy = new LocalStrategy(
      fakeUserGateway(() => Promise.reject(new Error('invalid credentials'))),
    );

    await expect(
      strategy.validate('user@mail.com', 'wrong-secret'),
    ).rejects.toMatchObject({ message: 'Invalid credentials', status: 403 });
  });

  it('should propagate the gateway infra Exception instead of forbidden', async () => {
    const infraError = ExceptionFactory.internal('User service timed out');
    const strategy = new LocalStrategy(
      fakeUserGateway(() => Promise.reject(infraError)),
    );

    await expect(strategy.validate('user@mail.com', 'secret')).rejects.toBe(
      infraError,
    );
  });
});
