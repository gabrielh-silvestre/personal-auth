import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { TokenModule } from '@tokens/token.module';
import { UserModule } from '@users/user.module';
import { RmqModule } from '@shared/modules/rmq/rmq.module';

import { LoginController } from './infra/api/controller/login/Login.controller';
import { LoginUseCase } from './useCase/login/Login.useCase';

import { ForgotPasswordController } from './infra/api/controller/forgotPassword/ForgotPassword.controller';
import { ForgotPasswordUseCase } from './useCase/forgotPassword/ForgotPassword.useCase';

import { JwtStrategy } from './infra/strategy/Jwt.strategy';
import { LocalStrategy } from './infra/strategy/Local.strategy';

import { TokenServiceAdaptor } from './infra/service/token/Token.service.adaptor';
import { UserServiceAdaptor } from './infra/service/user/User.service.adaptor';
import { MailServiceAdaptor } from './infra/service/mail/Mail.service.adaptor';

import { JWT_EXPIRES_IN, JWT_SECRET } from '@shared/utils/constants';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(JWT_SECRET, 'secret'),
        verifyOptions: {
          maxAge: configService.get<string>(JWT_EXPIRES_IN, '1d'),
        },
        signOptions: {
          expiresIn: configService.get<string>(JWT_EXPIRES_IN, '1d'),
        },
      }),
      inject: [ConfigService],
    }),
    RmqModule.register('MAIL'),
    forwardRef(() => UserModule),
    TokenModule,
  ],
  controllers: [LoginController, ForgotPasswordController],
  providers: [
    LoginUseCase,
    ForgotPasswordUseCase,
    JwtStrategy,
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
