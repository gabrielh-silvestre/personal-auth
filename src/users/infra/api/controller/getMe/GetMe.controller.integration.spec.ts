import type { Request } from 'express';

import { Test } from '@nestjs/testing';
import { from } from 'rxjs';

import { GetMeController } from './GetMe.controller';

import { GetUserByIdUseCase } from '@users/useCase/getById/GetUserById.useCase';

import { UserDatabaseMemoryAdapter } from '@users/infra/adapter/database/memory/UserMemory.adapter';
import { UserRepository } from '@users/infra/repository/User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';
import {
  AUTH_GATEWAY,
  USER_DATABASE_ADAPTER,
  USER_REPOSITORY,
} from '@users/utils/constants';

describe('Integration tests for Get Me controller', () => {
  let userController: GetMeController;
  const [{ id: userId }] = USERS_MOCK;

  beforeEach(async () => {
    UserDatabaseMemoryAdapter.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        GetMeController,
        GetUserByIdUseCase,
        {
          provide: USER_REPOSITORY,
          useClass: UserRepository,
        },
        {
          provide: USER_DATABASE_ADAPTER,
          useClass: UserDatabaseMemoryAdapter,
        },
        {
          provide: AUTH_GATEWAY,
          useValue: {
            verify: jest.fn().mockResolvedValue(from([{ userId }])),
          },
        },
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            verifyToken: jest.fn().mockResolvedValue({ userId }),
          },
        },
      ],
    }).compile();

    userController = module.get<GetMeController>(GetMeController);
  });

  describe('should get a user', () => {
    it('with REST request', async () => {
      const response = await userController.handleRest({
        user: { userId },
      } as Request);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });

    it('with gRPC request', async () => {
      const newUser = await userController.handleGrpc({
        user: { userId },
      } as Request);

      expect(newUser).not.toBeNull();
      expect(newUser).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });
  });
});
