import { v4 as uuid } from 'uuid';
import { Test } from '@nestjs/testing';

import { User } from '../../../../domain/entity/User';
import { UserGrpcServerController } from './User.grpc-server.controller';
import { UserService } from '../../../../user.service';
import { UserInMemoryRepository } from '../../../repository/memory/User.repository';

const USERS_MOCK: User[] = [
  new User(uuid(), 'John', 'john@email.com'),
  new User(uuid(), 'Doe', 'doe@email.com'),
  new User(uuid(), 'Jane', 'jane@email.com'),
];

describe('Integration test for gRPC server User controller', () => {
  let userController: UserGrpcServerController;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [UserGrpcServerController],
      providers: [UserService, UserInMemoryRepository],
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
      });

      expect(newUser).not.toBeNull();
      expect(newUser.id).toBeDefined();
      expect(newUser.username).toBe('Joe');
    });
  });
});
