import { Test } from '@nestjs/testing';

import { UserGrpcServerController } from './User.grpc-server.controller';
import { UserService } from '@users/user.service';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('Integration test for gRPC server User controller', () => {
  let userController: UserGrpcServerController;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [UserGrpcServerController],
      providers: [
        UserService,
        {
          provide: 'USER_REPO',
          useClass: UserInMemoryRepository,
        },
      ],
    }).compile();

    userController = module.get<UserGrpcServerController>(
      UserGrpcServerController,
    );
  });

  describe('create', () => {
    it('should create a user', async () => {
      const newUser = await userController.createUser({
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
