import { UserFactory } from './User.factory';

const VALID_USERNAME = 'username';
const VALID_EMAIL = 'email@email.com';
const VALID_PASSWORD = 'password';

describe('Test Domain User factory', () => {
  it('should create a new user', () => {
    const user = UserFactory.create(
      VALID_USERNAME,
      VALID_EMAIL,
      VALID_EMAIL,
      VALID_PASSWORD,
      VALID_PASSWORD,
    );

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.username).toBe('username');
    expect(user.email).toBe('email@email.com');

    expect(user.password).toBeDefined();
    expect(user.password.toString()).not.toBe('password');
  });

  it('should throw an error if emails do not match', () => {
    expect(() => {
      UserFactory.create(
        VALID_USERNAME,
        VALID_EMAIL,
        'u@email.com',
        VALID_PASSWORD,
        VALID_PASSWORD,
      );
    }).toThrowError('Emails must match');
  });

  it('should throw an error if passwords do not match', () => {
    expect(() => {
      UserFactory.create(
        VALID_USERNAME,
        VALID_EMAIL,
        VALID_EMAIL,
        VALID_PASSWORD,
        'pass',
      );
    }).toThrowError('Passwords must match');
  });
});
