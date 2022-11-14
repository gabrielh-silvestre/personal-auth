import { Module } from '@nestjs/common/decorators';
// import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@auth/auth.module';
import { RmqModule } from '@shared/modules/rmq/rmq.module';

import { UserPrismaRepository } from './infra/repository/prisma/User.repository';

import { CreateUserController } from './infra/api/controller/create/CreateUser.controller';
import { GetMeController } from './infra/api/controller/getMe/GetMe.controller';

import { UserFacade } from './infra/facade/User.facade';

import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';
import { GetUserByIdUseCase } from './useCase/getById/GetUserById.useCase';
import { GetUserByEmailUseCase } from './useCase/getByEmail/GetUserByEmail.useCase';

import { MailServiceAdaptor } from './infra/service/mail/Mail.service.adaptor';

@Module({
  imports: [RmqModule.register('MAIL'), AuthModule],
  controllers: [CreateUserController, GetMeController],
  providers: [
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    UserFacade,
    {
      provide: 'MAIL_SERVICE',
      useClass: MailServiceAdaptor,
    },
    {
      provide: 'USER_REPO',
      useClass: UserPrismaRepository,
    },
  ],
  exports: [UserFacade],
})
export class UserModule {}
