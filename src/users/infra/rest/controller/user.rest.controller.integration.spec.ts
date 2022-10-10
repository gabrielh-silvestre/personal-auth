import { Test } from '@nestjs/testing';

import { UserRestController } from './User.rest.controller';
import { UserService } from '@users/user.service';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('Integration test for REST User controller', () => {
  let userController: UserRestController;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [UserRestController],
      providers: [
        UserService,
        {
          provide: 'USER_REPO',
          useClass: UserInMemoryRepository,
        },
      ],
    }).compile();

    userController = module.get<UserRestController>(UserRestController);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const newUser = await userController.create({
        username: 'Joe',
        email: 'joe@email.com',
        confirmEmail: 'joe@email.com',
        password: 'password',
        confirmPassword: 'password',
      });

      expect(newUser).not.toBeNull();
      expect(newUser.id).toBeDefined();
      expect(newUser.username).toBe('Joe');
    });
  });
});
