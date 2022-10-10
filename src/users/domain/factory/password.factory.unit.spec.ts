import { PasswordFactory } from './Password.factory';

const VALID_PASSWORD = 'password';

describe('Unit test domain Password factory', () => {
  it('should create a new password', () => {
    const password = PasswordFactory.createNew(VALID_PASSWORD);

    expect(password).toBeDefined();
    expect(password.toString()).not.toBe('password');
  });

  it('should create a password from hash', () => {
    const password = PasswordFactory.createFromHash(VALID_PASSWORD);

    expect(password).toBeDefined();
    expect(password.toString()).toBe('password');
  });
});
