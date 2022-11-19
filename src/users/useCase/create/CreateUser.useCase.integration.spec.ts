import { Test } from '@nestjs/testing';

import { CreateUserUseCase } from './CreateUser.useCase';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

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
  let createUserUseCase: CreateUserUseCase;
  let welcomeMail: jest.Mock;

  beforeEach(async () => {
    welcomeMail = jest.fn();
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        CreateUserUseCase,
        {
          provide: 'MAIL_SERVICE',
          useValue: { welcomeMail },
        },
        {
          provide: 'USER_REPO',
          useClass: UserInMemoryRepository,
        },
      ],
    }).compile();

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should create a user with success', async () => {
    const newUser = await createUserUseCase.execute(VALID_NEW_USER);

    expect(newUser).not.toBeNull();
    expect(newUser).toStrictEqual({
      id: expect.any(String),
      username: expect.any(String),
    });

    expect(welcomeMail).toBeCalledTimes(1);
  });

  it('should throw an error if email is already registered', async () => {
    await expect(createUserUseCase.execute(INVALID_NEW_USER)).rejects.toThrow(
      'Email already registered',
    );

    expect(welcomeMail).not.toBeCalled();
  });

  it('should throw and error if credentials not match', async () => {
    await expect(
      createUserUseCase.execute({
        ...VALID_NEW_USER,
        confirmEmail: 'invalid-email',
      }),
    ).rejects.toThrow('Credentials not match');

    expect(welcomeMail).not.toBeCalled();

    await expect(
      createUserUseCase.execute({
        ...VALID_NEW_USER,
        confirmPassword: 'invalid-password',
      }),
    ).rejects.toThrow('Credentials not match');

    expect(welcomeMail).not.toBeCalled();
  });
});
