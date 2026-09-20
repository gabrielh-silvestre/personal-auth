import { NEVER, throwError } from 'rxjs';

import type { IUserAdapter } from '@auth/infra/adapter/user/User.adapter.interface';

import { UserGateway } from './User.gateway';

describe('Unit test for User gateway', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should reject with a treated Exception when the user service times out', async () => {
    const userAdapter: IUserAdapter = { send: jest.fn().mockReturnValue(NEVER) };
    const userGateway = new UserGateway(userAdapter);

    jest.useFakeTimers();
    const result = userGateway.verifyCredentials('email@test.com', 'password');
    jest.advanceTimersByTime(5000);

    await expect(result).rejects.toThrow('User service timeout');
  });

  it('should not wrap errors other than a timeout', async () => {
    const userAdapter: IUserAdapter = {
      send: jest.fn().mockReturnValue(throwError(() => new Error('invalid credentials'))),
    };
    const userGateway = new UserGateway(userAdapter);

    await expect(
      userGateway.verifyCredentials('email@test.com', 'password'),
    ).rejects.toThrow('invalid credentials');
  });
});
