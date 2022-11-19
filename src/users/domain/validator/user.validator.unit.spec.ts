import { UserClassValidator } from './user.class.validator';

import type { IUser } from '../entity/user.interface';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const [VALID_USER] = USERS_MOCK;

const ERROR_MESSAGES = {
  id: 'Id must be a valid UUID v4',
  /* ---------- */
  usernameMinLength: 'Username must be at least 3 characters long',
  usernameMaxLength: 'Username must be at most 8 characters long',
  usernameRequired: 'Username is required',
  /* ---------- */
  email: 'Email must be a valid email address',
  /* ---------- */
  createdAt: 'CreatedAt must be a valid date',
  updatedAt: 'UpdatedAt must be a valid date',
};

describe('Unit test User validator', () => {
  it('should not throw any errors on valid users', () => {
    const userValidator = UserClassValidator.init();

    expect(() => userValidator.validate(VALID_USER)).not.toThrow();
  });

  it(`should throw "${ERROR_MESSAGES.id}" error on invalid id`, () => {
    const userValidator = UserClassValidator.init();
    const invalidUser: IUser = {
      id: 'invalid-id',
      username: VALID_USER.username,
      email: VALID_USER.email,
      createdAt: VALID_USER.createdAt,
      updatedAt: VALID_USER.updatedAt,
      password: VALID_USER.password,
    };

    expect(() => userValidator.validate(invalidUser)).toThrow(
      ERROR_MESSAGES.id,
    );
  });

  it(`should throw "${ERROR_MESSAGES.usernameMinLength}" error on invalid username`, () => {
    const userValidator = UserClassValidator.init();
    const invalidUser: IUser = {
      id: VALID_USER.id,
      username: 'ab',
      email: VALID_USER.email,
      createdAt: VALID_USER.createdAt,
      updatedAt: VALID_USER.updatedAt,
      password: VALID_USER.password,
    };

    expect(() => userValidator.validate(invalidUser)).toThrow(
      ERROR_MESSAGES.usernameMinLength,
    );
  });

  it(`should throw "${ERROR_MESSAGES.usernameMaxLength}" error on invalid username`, () => {
    const userValidator = UserClassValidator.init();
    const invalidUser: IUser = {
      id: VALID_USER.id,
      username: 'abcdefghi',
      email: VALID_USER.email,
      createdAt: VALID_USER.createdAt,
      updatedAt: VALID_USER.updatedAt,
      password: VALID_USER.password,
    };

    expect(() => userValidator.validate(invalidUser)).toThrow(
      ERROR_MESSAGES.usernameMaxLength,
    );
  });

  it(`should throw "${ERROR_MESSAGES.usernameRequired}" error on invalid username`, () => {
    const userValidator = UserClassValidator.init();
    const invalidUser: IUser = {
      id: VALID_USER.id,
      username: '',
      email: VALID_USER.email,
      createdAt: VALID_USER.createdAt,
      updatedAt: VALID_USER.updatedAt,
      password: VALID_USER.password,
    };

    expect(() => userValidator.validate(invalidUser)).toThrow(
      ERROR_MESSAGES.usernameRequired,
    );
  });

  it(`should throw "${ERROR_MESSAGES.email}" error on invalid email`, () => {
    const userValidator = UserClassValidator.init();
    const invalidUser: IUser = {
      id: VALID_USER.id,
      username: VALID_USER.username,
      email: 'invalid-email',
      createdAt: VALID_USER.createdAt,
      updatedAt: VALID_USER.updatedAt,
      password: VALID_USER.password,
    };

    expect(() => userValidator.validate(invalidUser)).toThrow(
      ERROR_MESSAGES.email,
    );
  });

  it(`should throw "${ERROR_MESSAGES.createdAt}" error on invalid createdAt`, () => {
    const userValidator = UserClassValidator.init();
    const invalidUser: IUser = {
      id: VALID_USER.id,
      username: VALID_USER.username,
      email: VALID_USER.email,
      createdAt: new Date('invalid-date'),
      updatedAt: VALID_USER.updatedAt,
      password: VALID_USER.password,
    };

    expect(() => userValidator.validate(invalidUser)).toThrow(
      ERROR_MESSAGES.createdAt,
    );
  });

  it(`should throw "${ERROR_MESSAGES.updatedAt}" error on invalid updatedAt`, () => {
    const userValidator = UserClassValidator.init();
    const invalidUser: IUser = {
      id: VALID_USER.id,
      username: VALID_USER.username,
      email: VALID_USER.email,
      createdAt: VALID_USER.createdAt,
      updatedAt: new Date('invalid-date'),
      password: VALID_USER.password,
    };

    expect(() => userValidator.validate(invalidUser)).toThrow(
      ERROR_MESSAGES.updatedAt,
    );
  });
});
