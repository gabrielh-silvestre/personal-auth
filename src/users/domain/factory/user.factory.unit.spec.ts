import { UserFactory } from './User.factory';

const VALID_ID = 'c0a80121-7acc-4fd3-8cda-4d18c0375a59';
const VALID_USERNAME = 'username';
const VALID_EMAIL = 'email@email.com';
const VALID_PASSWORD = 'password';

describe('Test Domain User factory', () => {
  it('should create a new user', () => {
    const user = UserFactory.create(
      VALID_USERNAME,
      VALID_EMAIL,
      VALID_PASSWORD,
    );

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.username).toBe('username');
    expect(user.email).toBe('email@email.com');

    expect(user.password).toBeDefined();
    expect(user.password.toString()).not.toBe('password');
  });

  it('should create a user from persistence', () => {
    const user = UserFactory.createFromPersistence(
      VALID_ID,
      VALID_USERNAME,
      VALID_EMAIL,
      new Date(),
      new Date(),
      VALID_PASSWORD,
    );

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.username).toBe('username');
    expect(user.email).toBe('email@email.com');

    expect(user.password).toBeDefined();
    expect(user.password.toString()).toBe('password');
  });
});
