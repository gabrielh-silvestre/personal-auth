import { v4 as uuid } from 'uuid';

import { User } from './User';
import { PasswordFactory } from '../factory/Password.factory';

const VALID_USERNAME = 'username';
const VALID_EMAIL = 'email@email.com';

describe('Unit test domain User entity', () => {
  it('should create a new user', () => {
    const user = new User(
      uuid(),
      VALID_USERNAME,
      VALID_EMAIL,
      new Date(),
      new Date(),
    );

    expect(user).toBeDefined();
    expect(user.updatedAt).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toEqual(user.createdAt);
  });

  it('should change username', () => {
    const user = new User(
      uuid(),
      VALID_USERNAME,
      VALID_EMAIL,
      new Date(),
      new Date(),
    );

    user.changeUsername('newUser');
    expect(user.username).toBe('newUser');
  });

  it('should change email', () => {
    const user = new User(
      uuid(),
      VALID_USERNAME,
      VALID_EMAIL,
      new Date(),
      new Date(),
    );

    user.changeEmail('newEmail@email.com');
    expect(user.email).toBe('newEmail@email.com');
  });

  it('should change password', () => {
    const user = new User(
      uuid(),
      VALID_USERNAME,
      VALID_EMAIL,
      new Date(),
      new Date(),
    );

    user.changePassword(PasswordFactory.createNew('newPassword'));
    expect(user.password.isEqual('newPassword')).toBeTruthy();
  });

  it('should throw error when id is invalid', () => {
    expect(
      () =>
        new User('invalidId', VALID_USERNAME, 'email', new Date(), new Date()),
    ).toThrowError('Id must be a valid UUID v4');
  });

  it('should throw error when username is invalid', () => {
    expect(
      () => new User(uuid(), 'u', VALID_EMAIL, new Date(), new Date()),
    ).toThrowError('Username must be at least 3 characters long');

    expect(
      () =>
        new User(
          uuid(),
          VALID_USERNAME.repeat(20),
          'email',
          new Date(),
          new Date(),
        ),
    ).toThrowError('Username must be at most 8 characters long');
  });

  it('should throw error when email is invalid', () => {
    expect(
      () => new User(uuid(), VALID_USERNAME, 'email', new Date(), new Date()),
    ).toThrowError('Email must be a valid email address');
  });

  it('should throw error when change to a invalid username', () => {
    const user = new User(
      uuid(),
      VALID_USERNAME,
      VALID_EMAIL,
      new Date(),
      new Date(),
    );

    expect(() => user.changeUsername('u')).toThrowError(
      'Username must be at least 3 characters long',
    );

    expect(() => user.changeUsername(VALID_USERNAME.repeat(20))).toThrowError(
      'Username must be at most 8 characters long',
    );
  });

  it('should throw error when change to a invalid email', () => {
    const user = new User(
      uuid(),
      VALID_USERNAME,
      VALID_EMAIL,
      new Date(),
      new Date(),
    );

    expect(() => user.changeEmail('email')).toThrowError(
      'Email must be a valid email address',
    );
  });

  it('should throw error when change to a invalid password', () => {
    const user = new User(
      uuid(),
      VALID_USERNAME,
      VALID_EMAIL,
      new Date(),
      new Date(),
    );

    expect(() =>
      user.changePassword(PasswordFactory.createNew('')),
    ).toThrowError('Password is required');

    expect(() =>
      user.changePassword(PasswordFactory.createNew('p')),
    ).toThrowError('Password must be at least 8 characters long');

    expect(() =>
      user.changePassword(PasswordFactory.createNew('password'.repeat(20))),
    ).toThrowError('Password must be at most 16 characters long');
  });

  it('should throw error when insert a invalid create date', () => {
    expect(
      () =>
        new User(
          uuid(),
          VALID_USERNAME,
          VALID_EMAIL,
          new Date('invalid'),
          new Date(),
        ),
    ).toThrowError('CreatedAt must be a valid date');
  });

  it('should throw error when insert a invalid update date', () => {
    expect(
      () =>
        new User(
          uuid(),
          VALID_USERNAME,
          VALID_EMAIL,
          new Date(),
          new Date('invalid'),
        ),
    ).toThrowError('UpdatedAt must be a valid date');
  });
});
