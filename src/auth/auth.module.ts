import { forwardRef, Module } from '@nestjs/common';

import { TokenModule } from '@tokens/token.module';
import { UserModule } from '@users/user.module';

import { RmqModule } from '@shared/modules/rmq/rmq.module';
import { JwtAccessModule } from '@shared/modules/jwt/JwtAccess.module';
import { JwtRefreshModule } from '@shared/modules/jwt/JwtRefresh.module';

import { LoginController } from './infra/api/controller/login/Login.controller';
import { LoginUseCase } from './useCase/login/Login.useCase';

import { ForgotPasswordController } from './infra/api/controller/forgotPassword/ForgotPassword.controller';
import { ForgotPasswordUseCase } from './useCase/forgotPassword/ForgotPassword.useCase';

import { JwtAccessTokenStrategy } from './infra/strategy/Jwt.access-token.strategy';
import { LocalStrategy } from './infra/strategy/Local.strategy';

import { TokenServiceAdaptor } from './infra/service/token/Token.service.adaptor';
import { UserServiceAdaptor } from './infra/service/user/User.service.adaptor';
import { MailServiceAdaptor } from './infra/service/mail/Mail.service.adaptor';

@Module({
  imports: [
    JwtAccessModule,
    JwtRefreshModule,
    RmqModule.register('MAIL'),
    forwardRef(() => UserModule),
    TokenModule,
  ],
  controllers: [LoginController, ForgotPasswordController],
  providers: [
    LoginUseCase,
    ForgotPasswordUseCase,
    JwtAccessTokenStrategy,
    LocalStrategy,
    {
      provide: 'TOKEN_SERVICE',
      useClass: TokenServiceAdaptor,
    },
    {
      provide: 'USER_SERVICE',
      useClass: UserServiceAdaptor,
    },
    {
      provide: 'MAIL_SERVICE',
      useClass: MailServiceAdaptor,
    },
  ],
  exports: [{ provide: 'TOKEN_SERVICE', useClass: TokenServiceAdaptor }],
})
export class AuthModule {}
