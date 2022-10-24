import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';

import { CreateUserUseCase } from './CreateUser.useCase';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { MailServiceAdaptor } from '@users/infra/service/mail/Mail.service.adaptor';

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

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot({ removeListener: true })],
      providers: [
        CreateUserUseCase,
        {
          provide: 'MAIL_SERVICE',
          useClass: MailServiceAdaptor,
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
  });

  it('should throw an error if email is already registered', async () => {
    await expect(createUserUseCase.execute(INVALID_NEW_USER)).rejects.toThrow(
      'Email already registered',
    );
  });
});
