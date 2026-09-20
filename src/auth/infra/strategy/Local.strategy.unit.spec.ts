import type { IUserGateway } from '../gateway/user/user.gateway.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

import { LocalStrategy } from './Local.strategy';

describe('Unit test for Local strategy', () => {
  it('should propagate a treated Exception as-is', async () => {
    const infraError = ExceptionFactory.internal('User service timeout');
    const userGateway: IUserGateway = {
      verifyCredentials: jest.fn().mockRejectedValueOnce(infraError),
    };
    const strategy = new LocalStrategy(userGateway);

    await expect(
      strategy.validate('email@test.com', 'password'),
    ).rejects.toBe(infraError);
  });

  it('should throw forbidden Invalid credentials for any other error', async () => {
    const userGateway: IUserGateway = {
      verifyCredentials: jest.fn().mockRejectedValueOnce(new Error('wrong password')),
    };
    const strategy = new LocalStrategy(userGateway);

    await expect(
      strategy.validate('email@test.com', 'password'),
    ).rejects.toThrow('Invalid credentials');
  });
});
