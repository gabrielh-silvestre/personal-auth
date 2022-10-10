import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from '@auth/auth.service';
import { AuthRestController } from './Auth.rest.controller';

import { UserService } from '@users/user.service';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { TokenService } from '@tokens/token.service';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

describe('Integration test for REST Auth controller', () => {
  let authController: AuthRestController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test',
          verifyOptions: { maxAge: '3m' },
          signOptions: { expiresIn: '3m' },
        }),
      ],
      controllers: [AuthRestController],
      providers: [
        UserService,
        TokenService,
        AuthService,
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

    authController = module.get<AuthRestController>(AuthRestController);
  });

  describe('login', () => {
    it('should login a user', async () => {
      const token = await authController.login({
        id: '1',
        username: 'test',
      });

      expect(token).not.toBeNull();
      expect(typeof token.token).toBe('string');
    });
  });
});
