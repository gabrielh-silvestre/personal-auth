import { forwardRef, Module } from '@nestjs/common';

import { TokenModule } from '@tokens/token.module';
import { UserModule } from '@users/user.module';

import { LoginController } from './infra/api/controller/login/Login.controller';
import { LoginUseCase } from './useCase/login/Login.useCase';

import { ForgotPasswordController } from './infra/api/controller/forgotPassword/ForgotPassword.controller';
import { ForgotPasswordUseCase } from './useCase/forgotPassword/ForgotPassword.useCase';

import { TokenServiceAdaptor } from './infra/service/token/Token.service.adaptor';
import { UserServiceAdaptor } from './infra/service/user/User.service.adaptor';

@Module({
  imports: [forwardRef(() => UserModule), TokenModule],
  controllers: [LoginController, ForgotPasswordController],
  providers: [
    LoginUseCase,
    ForgotPasswordUseCase,
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
      useValue: {
        recoverPasswordMail: () => Promise.resolve(),
      },
    },
  ],
  exports: [{ provide: 'TOKEN_SERVICE', useClass: TokenServiceAdaptor }],
})
export class AuthModule {}
