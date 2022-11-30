import { Module } from '@nestjs/common/decorators';
// import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@auth/auth.module';
import { RmqModule } from '@shared/modules/rmq/rmq.module';

import { UserDatabasePrismaAdapter } from './infra/adapter/database/prisma/UserPrisma.adapter';
import { UserRepository } from './infra/repository/User.repository';

import { CreateUserController } from './infra/api/controller/create/CreateUser.controller';
import { GetMeController } from './infra/api/controller/getMe/GetMe.controller';

import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';
import { GetUserByIdUseCase } from './useCase/getById/GetUserById.useCase';
import { GetUserByEmailUseCase } from './useCase/getByEmail/GetUserByEmail.useCase';

import { MailRmqAdapter } from './infra/adapter/mail/rmq/MailRmq.adapter';
import { MailGateway } from './infra/gateway/mail/Mail.gateway';

@Module({
  imports: [RmqModule.register('MAIL'), AuthModule],
  exports: [GetUserByIdUseCase, GetUserByEmailUseCase],
  controllers: [CreateUserController, GetMeController],
  providers: [
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    {
      provide: 'MAIL_SERVICE',
      useClass: MailGateway,
    },
    {
      provide: 'MAIL_ADAPTER',
      useClass: MailRmqAdapter,
    },
    {
      provide: 'USER_REPO',
      useClass: UserRepository,
    },
    {
      provide: 'USER_DATABASE',
      useClass: UserDatabasePrismaAdapter,
    },
  ],
})
export class UserModule {}
