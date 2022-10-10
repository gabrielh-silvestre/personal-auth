import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { TokenService } from '@tokens/token.service';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { UserService } from './user.service';
import { UserInMemoryRepository } from './infra/repository/memory/User.repository';

import { LoginService } from './login.service';

describe('Integration test for Login service', () => {
  let loginService: LoginService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
          verifyOptions: { maxAge: '1m' },
          signOptions: { expiresIn: '1m' },
        }),
      ],
      providers: [
        LoginService,
        TokenService,
        UserService,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
        { provide: 'USER_REPO', useClass: UserInMemoryRepository },
      ],
    }).compile();

    loginService = module.get<LoginService>(LoginService);
  });

  describe('login', () => {
    it('should return a token', async () => {
      const token = await loginService.login({ id: '1', username: 'Joe' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});
