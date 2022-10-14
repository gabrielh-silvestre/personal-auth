import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { UserGrpcServerController } from './User.grpc-server.controller';
import { UserService } from '@users/user.service';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { TokenService } from '@tokens/token.service';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';
import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';

const VALID_NEW_USER = {
  username: 'Joe',
  email: 'joe@email.com',
  confirmEmail: 'joe@email.com',
  password: 'password',
  confirmPassword: 'password',
};

const VALID_LOGIN_USER = {
  email: VALID_NEW_USER.email,
  password: VALID_NEW_USER.password,
};

describe('Integration test for gRPC server User controller', () => {
  let userController: UserGrpcServerController;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register(JWT_OPTIONS_MOCK),
        EventEmitterModule.forRoot({ removeListener: true }),
      ],
      controllers: [UserGrpcServerController],
      providers: [
        UserService,
        TokenService,
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

    userController = module.get<UserGrpcServerController>(
      UserGrpcServerController,
    );
  });

  describe('create', () => {
    it('should create a user', async () => {
      const newUser = await userController.createUser(VALID_NEW_USER);

      expect(newUser).not.toBeNull();
      expect(newUser).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      await userController.createUser(VALID_NEW_USER);
      const login = await userController.loginUser(VALID_LOGIN_USER);

      expect(login).not.toBeNull();
      expect(login).toStrictEqual({
        token: expect.any(String),
      });
    });
  });

  describe('recover user', () => {
    it('should recover a user', async () => {
      await userController.createUser(VALID_NEW_USER);
      const { token } = await userController.loginUser(VALID_LOGIN_USER);

      const recover = await userController.recoverUser({ token });

      expect(recover).not.toBeNull();
      expect(recover).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });
  });
});
