import { v4 as uuid } from 'uuid';
import { Test } from '@nestjs/testing';

import type { ReponseCreateUserDto } from 'src/users/dto/CreateUser.dto';

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
      const newUser = (await userController.createUser({
        username: 'Joe',
        email: 'joe@email.com',
        confirmEmail: 'joe@email.com',
        password: 'password',
        confirmPassword: 'password',
      })) as ReponseCreateUserDto;

      expect(newUser).not.toBeNull();
      expect(newUser.user.id).toBeDefined();
      expect(newUser.user.username).toBe('Joe');
    });
  });
});
