import type { IMailGateway } from '@users/infra/gateway/mail/Mail.gateway.interface';
import type { IMailService } from '@users/infra/service/mail/mail.service.interface';
import type { IUserDatabaseGateway } from '@users/infra/gateway/database/UserDatabase.gateway.interface';

import { CreateUserUseCase } from './CreateUser.useCase';

import { UserMemoryGateway } from '@users/infra/gateway/database/memory/UserMemory.gateway';
import { UserRepository } from '@users/infra/repository/User.repository';

import { MailService } from '@users/infra/service/mail/Mail.service';

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
  UserMemoryGateway.reset(USERS_MOCK);

  let userDatabaseGateway: IUserDatabaseGateway;
  let userRepository: UserRepository;

  let mailGateway: IMailGateway;
  let mailService: IMailService;

  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userDatabaseGateway = new UserMemoryGateway();
    userRepository = new UserRepository(userDatabaseGateway);

    mailGateway = { send: jest.fn() };
    mailService = new MailService(mailGateway);

    createUserUseCase = new CreateUserUseCase(userRepository, mailService);
  });

  it('should create a user with success', async () => {
    const newUser = await createUserUseCase.execute(VALID_NEW_USER);

    expect(newUser).not.toBeNull();
    expect(newUser).toStrictEqual({
      id: expect.any(String),
      username: expect.any(String),
    });

    expect(mailGateway.send).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if email is already registered', async () => {
    await expect(createUserUseCase.execute(INVALID_NEW_USER)).rejects.toThrow(
      'Email already registered',
    );

    expect(mailGateway.send).not.toBeCalled();
  });

  it('should throw and error if credentials not match', async () => {
    await expect(
      createUserUseCase.execute({
        ...VALID_NEW_USER,
        confirmEmail: 'invalid-email',
      }),
    ).rejects.toThrow('Credentials not match');

    expect(mailGateway.send).not.toBeCalled();

    await expect(
      createUserUseCase.execute({
        ...VALID_NEW_USER,
        confirmPassword: 'invalid-password',
      }),
    ).rejects.toThrow('Credentials not match');

    expect(mailGateway.send).not.toBeCalled();
  });
});
