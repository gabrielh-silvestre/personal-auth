import { Module } from '@nestjs/common';

import { TokenModule } from '@tokens/token.module';

import { RmqModule } from '@shared/modules/rmq/rmq.module';
import { CustomJwtModule } from '@shared/modules/jwt/Jwt.module';

import { LoginController } from './infra/api/controller/login/Login.controller';
import { LoginUseCase } from './useCase/login/Login.useCase';

import { RefreshController } from './infra/api/controller/refresh/Refresh.controller';
import { RefreshUseCase } from './useCase/refresh/Refresh.useCase';

import { JwtAccessTokenStrategy } from './infra/strategy/Jwt.access-token.strategy';
import { JwtRefreshTokenStrategy } from './infra/strategy/Jwt.refresh-token.strategy';
import { LocalStrategy } from './infra/strategy/Local.strategy';

import { TokenServiceAdaptor } from './infra/service/token/Token.service.adaptor';
import { UserServiceAdaptor } from './infra/service/user/User.service.adaptor';
import { MailServiceAdaptor } from './infra/service/mail/Mail.service.adaptor';

@Module({
  imports: [
    CustomJwtModule,
    RmqModule.register('MAIL'),
    RmqModule.register('USER'),
    TokenModule,
  ],
  controllers: [LoginController, RefreshController],
  providers: [
    LoginUseCase,
    RefreshUseCase,
    LocalStrategy,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
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
