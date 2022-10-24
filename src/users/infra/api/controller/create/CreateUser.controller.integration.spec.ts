import { Test } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { CreateUserController } from './CreateUser.controller';
import { CreateUserUseCase } from '@users/useCase/create/CreateUser.useCase';

import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { MailServiceAdaptor } from '@users/infra/service/mail/Mail.service.adaptor';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const VALID_NEW_USER = {
  username: 'Joe',
  email: 'joe@email.com',
  confirmEmail: 'joe@email.com',
  password: 'password',
  confirmPassword: 'password',
};

describe('Integration test for Create User controller', () => {
  let userController: CreateUserController;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot({ removeListener: true })],
      providers: [
        CreateUserController,
        CreateUserUseCase,
        {
          provide: 'MAIL_SERVICE',
          useClass: MailServiceAdaptor,
        },
        {
          provide: 'USER_REPO',
          useClass: UserInMemoryRepository,
        },
        {
          provide: 'TOKEN_REPO',
          useClass: TokenInMemoryRepository,
        },
      ],
    }).compile();

    userController = module.get<CreateUserController>(CreateUserController);
  });

  describe('should create a user', () => {
    it('with REST request', async () => {
      const response = await userController.handleRest(VALID_NEW_USER);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });

    it('with gRPC request', async () => {
      const newUser = await userController.handleGrpc(VALID_NEW_USER);

      expect(newUser).not.toBeNull();
      expect(newUser).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });
  });
});
