import { v4 as uuid } from 'uuid';
import { User } from './User';

describe('Test Domain User entity', () => {
  it('should create a new user', () => {
    const user = new User(uuid(), 'username', 'email@email.com');
    expect(user).toBeDefined();
  });

  it('should change username', () => {
    const user = new User(uuid(), 'username', 'email@email.com');

    user.changeUsername('newUser');
    expect(user.username).toBe('newUser');
  });

  it('should change email', () => {
    const user = new User(uuid(), 'username', 'email@email.com');

    user.changeEmail('newEmail@email.com');
    expect(user.email).toBe('newEmail@email.com');
  });

  it('should throw error when id is invalid', () => {
    expect(() => new User('invalidId', 'username', 'email')).toThrowError(
      'Id must be a valid UUID v4',
    );
  });

  it('should throw error when username is invalid', () => {
    expect(() => new User(uuid(), 'u', 'email@email.com')).toThrowError(
      'Username must be at least 3 characters long',
    );

    expect(() => new User(uuid(), 'username'.repeat(20), 'email')).toThrowError(
      'Username must be at most 8 characters long',
    );
  });

  it('should throw error when email is invalid', () => {
    expect(() => new User(uuid(), 'username', 'email')).toThrowError(
      'Email must be a valid email address',
    );
  });

  it('should throw error when change to a invalid username', () => {
    const user = new User(uuid(), 'username', 'email@email.com');

    expect(() => user.changeUsername('u')).toThrowError(
      'Username must be at least 3 characters long',
    );

    expect(() => user.changeUsername('username'.repeat(20))).toThrowError(
      'Username must be at most 8 characters long',
    );
  });

  it('should throw error when change to a invalid email', () => {
    const user = new User(uuid(), 'username', 'email@email.com');

    expect(() => user.changeEmail('email')).toThrowError(
      'Email must be a valid email address',
    );
  });
});
