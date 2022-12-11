import { from } from 'rxjs';

import type { IAuthAdapter } from '@users/infra/adapter/auth/Auth.adapter.interface';
import type { IAuthGateway } from './auth.gateway.interface';

import { AuthGateway } from './Auth.gateway';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const [{ id: userId }] = USERS_MOCK;

describe('Unit test for Auth gateway', () => {
  const mockVerify = jest.fn();

  let authGateway: IAuthGateway;
  const authAdapter: IAuthAdapter = {
    verify: mockVerify.mockReturnValue(from([{ userId }])),
  };

  beforeEach(() => {
    authGateway = new AuthGateway(authAdapter);
  });

  it('should verify a token', async () => {
    const response = await authGateway.verify('fake-token');

    expect(response).toStrictEqual({ userId: expect.any(String) });
  });

  it('should return null if token is invalid', async () => {
    mockVerify.mockReturnValue(from([null]));

    const response = await authGateway.verify('fake-token');

    expect(response).toBeNull();
  });
});
