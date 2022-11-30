import type { IMailAdapter } from '@users/infra/adapter/mail/Mail.adapter.interface';
import type { IMailGateway } from '@users/infra/gateway/mail/mail.gateway.interface';
import type { IUserDatabaseAdapter } from '@users/infra/adapter/database/UserDatabase.adapter.interface';

import { CreateUserUseCase } from './CreateUser.useCase';

import { UserDatabaseMemoryAdapter } from '@users/infra/adapter/database/memory/UserMemory.adapter';
import { UserRepository } from '@users/infra/repository/User.repository';

import { MailGateway } from '@users/infra/gateway/mail/Mail.gateway';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const VALID_NEW_USER = {
  username: 'Joe',
  email: 'joe@email.com',
  confirmEmail: 'joe@email.com',
  password: 'password',
  confirmPassword: 'password',
};

const INVALID_NEW_USER = {
  username: USERS_MOCK[0].username,
  email: USERS_MOCK[0].email,
  confirmEmail: USERS_MOCK[0].email,
  password: 'password',
  confirmPassword: 'password',
};

describe('Integration test for Create User use case', () => {
  UserDatabaseMemoryAdapter.reset(USERS_MOCK);

  let userDatabaseGateway: IUserDatabaseAdapter;
  let userRepository: UserRepository;

  let mailAdapter: IMailAdapter;
  let mailGateway: IMailGateway;

  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userDatabaseGateway = new UserDatabaseMemoryAdapter();
    userRepository = new UserRepository(userDatabaseGateway);

    mailAdapter = { send: jest.fn() };
    mailGateway = new MailGateway(mailAdapter);

    createUserUseCase = new CreateUserUseCase(userRepository, mailGateway);
  });

  it('should create a user with success', async () => {
    const newUser = await createUserUseCase.execute(VALID_NEW_USER);

    expect(newUser).not.toBeNull();
    expect(newUser).toStrictEqual({
      id: expect.any(String),
      username: expect.any(String),
    });

    expect(mailAdapter.send).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if email is already registered', async () => {
    await expect(createUserUseCase.execute(INVALID_NEW_USER)).rejects.toThrow(
      'Email already registered',
    );

    expect(mailAdapter.send).not.toBeCalled();
  });

  it('should throw and error if credentials not match', async () => {
    await expect(
      createUserUseCase.execute({
        ...VALID_NEW_USER,
        confirmEmail: 'invalid-email',
      }),
    ).rejects.toThrow('Credentials not match');

    expect(mailAdapter.send).not.toBeCalled();

    await expect(
      createUserUseCase.execute({
        ...VALID_NEW_USER,
        confirmPassword: 'invalid-password',
      }),
    ).rejects.toThrow('Credentials not match');

    expect(mailAdapter.send).not.toBeCalled();
  });
});
