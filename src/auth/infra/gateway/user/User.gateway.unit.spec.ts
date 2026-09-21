import type { Observable } from 'rxjs';
import { NEVER, throwError } from 'rxjs';

import type { IUserAdapter } from '#auth/infra/adapter/user/user.adapter.interface';
import type { OutputUser } from '#auth/infra/gateway/user/user.gateway.interface';
import {
  USER_SERVICE_TIMEOUT_MS,
  UserGateway,
} from '#auth/infra/gateway/user/User.gateway';
import { Exception } from '#exceptions/entity/Exception';

function fakeAdapter(send: () => Observable<OutputUser>): IUserAdapter {
  return { send };
}

describe('Unit test UserGateway', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should reject with a handled Exception instead of hanging when the user service never replies', async () => {
    const gateway = new UserGateway(fakeAdapter(() => NEVER));

    const pendingError = gateway
      .verifyCredentials('user@mail.com', 'secret')
      .catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(USER_SERVICE_TIMEOUT_MS);
    const error = await pendingError;

    expect(error).toBeInstanceOf(Exception);
    expect(error).toHaveProperty('message', 'User service timed out');
  });

  it('should reject with the original error unwrapped when it is not a timeout', async () => {
    const originalError = new Error('connection refused');
    const gateway = new UserGateway(
      fakeAdapter(() => throwError(() => originalError)),
    );

    await expect(
      gateway.verifyCredentials('user@mail.com', 'secret'),
    ).rejects.toBe(originalError);
  });
});
