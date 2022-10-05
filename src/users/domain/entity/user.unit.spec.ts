import { v4 as uuid } from 'uuid';

import { Password } from '../value-object/Password';
import { User } from './User';

const VALID_USERNAME = 'username';
const VALID_EMAIL = 'email@email.com';

describe('Unit test domain User entity', () => {
  it('should create a new user', () => {
    const user = new User(uuid(), VALID_USERNAME, VALID_EMAIL);
    expect(user).toBeDefined();
  });

  it('should change username', () => {
    const user = new User(uuid(), VALID_USERNAME, VALID_EMAIL);

    user.changeUsername('newUser');
    expect(user.username).toBe('newUser');
  });

  it('should change email', () => {
    const user = new User(uuid(), VALID_USERNAME, VALID_EMAIL);

    user.changeEmail('newEmail@email.com');
    expect(user.email).toBe('newEmail@email.com');
  });

  it('should change password', () => {
    const user = new User(uuid(), VALID_USERNAME, VALID_EMAIL);

    user.changePassword(new Password('newPassword'));
    expect(user.password.isEqual('newPassword')).toBeTruthy();
  });

  it('should throw error when id is invalid', () => {
    expect(() => new User('invalidId', VALID_USERNAME, 'email')).toThrowError(
      'Id must be a valid UUID v4',
    );
  });

  it('should throw error when username is invalid', () => {
    expect(() => new User(uuid(), 'u', VALID_EMAIL)).toThrowError(
      'Username must be at least 3 characters long',
    );

    expect(
      () => new User(uuid(), VALID_USERNAME.repeat(20), 'email'),
    ).toThrowError('Username must be at most 8 characters long');
  });

  it('should throw error when email is invalid', () => {
    expect(() => new User(uuid(), VALID_USERNAME, 'email')).toThrowError(
      'Email must be a valid email address',
    );
  });

  it('should throw error when change to a invalid username', () => {
    const user = new User(uuid(), VALID_USERNAME, VALID_EMAIL);

    expect(() => user.changeUsername('u')).toThrowError(
      'Username must be at least 3 characters long',
    );

    expect(() => user.changeUsername(VALID_USERNAME.repeat(20))).toThrowError(
      'Username must be at most 8 characters long',
    );
  });

  it('should throw error when change to a invalid email', () => {
    const user = new User(uuid(), VALID_USERNAME, VALID_EMAIL);

    expect(() => user.changeEmail('email')).toThrowError(
      'Email must be a valid email address',
    );
  });

  it('should throw error when change to a invalid password', () => {
    const user = new User(uuid(), VALID_USERNAME, VALID_EMAIL);

    expect(() => user.changePassword(new Password('p'))).toThrowError(
      'Password must be at least 8 characters long',
    );

    expect(() =>
      user.changePassword(new Password('password'.repeat(20))),
    ).toThrowError('Password must be at most 16 characters long');
  });
});
