import { Test } from '@nestjs/testing';

import { CreateUserController } from './CreateUser.controller';
import { CreateUserUseCase } from '@users/useCase/create/CreateUser.useCase';

import { UserDatabaseMemoryAdapter } from '@users/infra/adapter/database/memory/UserMemory.adapter';
import { UserRepository } from '@users/infra/repository/User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';
import {
  MAIL_GATEWAY,
  USER_DATABASE_ADAPTER,
  USER_REPOSITORY,
} from '@users/utils/constants';

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
    UserDatabaseMemoryAdapter.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        CreateUserController,
        CreateUserUseCase,
        {
          provide: MAIL_GATEWAY,
          useValue: {
            welcomeMail: jest.fn(),
          },
        },
        {
          provide: USER_DATABASE_ADAPTER,
          useClass: UserDatabaseMemoryAdapter,
        },
        {
          provide: USER_REPOSITORY,
          useClass: UserRepository,
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
