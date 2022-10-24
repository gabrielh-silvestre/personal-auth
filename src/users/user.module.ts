import { Module } from '@nestjs/common/decorators';

import { UserPrismaRepository } from './infra/repository/prisma/User.repository';

import { CreateUserController } from './infra/api/controller/create/CreateUser.controller';
import { GetMeController } from './infra/api/controller/getMe/GetMe.controller';

import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';
import { GetUserByIdUseCase } from './useCase/getById/GetUserById.useCase';
import { GetUserByEmailUseCase } from './useCase/getByEmail/GetUserByEmail.useCase';

import { MailServiceAdaptor } from './infra/service/mail/Mail.service.adaptor';

import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [AuthModule],
  exports: [GetUserByIdUseCase, GetUserByEmailUseCase],
  controllers: [CreateUserController, GetMeController],
  providers: [
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    {
      provide: 'MAIL_SERVICE',
      useClass: MailServiceAdaptor,
    },
    {
      provide: 'USER_REPO',
      useClass: UserPrismaRepository,
    },
  ],
})
export class UserModule {}
