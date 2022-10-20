import { Module } from '@nestjs/common';

import { TokenModule } from '@tokens/token.module';
import { UserModule } from '@users/user.module';

import { LoginController } from './infra/api/controller/Login.controller';
import { LoginUseCase } from './useCase/login/Login.useCase';

import { TokenServiceAdaptor } from './infra/service/token/Token.service.adaptor';
import { UserServiceAdaptor } from './infra/service/user/User.service.adaptor';

@Module({
  imports: [UserModule, TokenModule],
  controllers: [LoginController],
  providers: [
    LoginUseCase,
    {
      provide: 'TOKEN_SERVICE',
      useClass: TokenServiceAdaptor,
    },
    {
      provide: 'USER_SERVICE',
      useClass: UserServiceAdaptor,
    },
  ],
})
export class AuthModule {}