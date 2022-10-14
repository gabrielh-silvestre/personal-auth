import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { UserRestController } from './User.rest.controller';
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

describe('Integration test for REST User controller', () => {
  let userController: UserRestController;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register(JWT_OPTIONS_MOCK),
        EventEmitterModule.forRoot({ removeListener: true }),
      ],
      controllers: [UserRestController],
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

    userController = module.get<UserRestController>(UserRestController);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const newUser = await userController.create(VALID_NEW_USER);

      expect(newUser).not.toBeNull();
      expect(newUser).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const newUser = await userController.create(VALID_NEW_USER);
      const loginResponse = await userController.login(newUser);

      expect(loginResponse).not.toBeNull();
      expect(loginResponse).toStrictEqual({
        token: expect.any(String),
      });
    });
  });

  describe('recover user', () => {
    it('should recover a user', async () => {
      const newUser = await userController.create(VALID_NEW_USER);
      const { token } = await userController.login(newUser);
      const recoverResponse = await userController.recover(token);

      expect(recoverResponse).not.toBeNull();
      expect(recoverResponse).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });
  });
});
