import { Module } from '@nestjs/common/decorators';
// import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@auth/auth.module';
import { RmqModule } from '@shared/modules/rmq/rmq.module';

import { UserPrismaAdapter } from './infra/adapter/database/prisma/UserPrisma.adapter';
import { UserRepository } from './infra/repository/User.repository';

import { CreateUserController } from './infra/api/controller/create/CreateUser.controller';
import { GetMeController } from './infra/api/controller/getMe/GetMe.controller';

import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';
import { GetUserByIdUseCase } from './useCase/getById/GetUserById.useCase';
import { GetUserByEmailUseCase } from './useCase/getByEmail/GetUserByEmail.useCase';

import { MailRmqGateway } from './infra/adapter/mail/rmq/MailRmq.gateway';
import { MailService } from './infra/service/mail/Mail.service';

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
      useClass: MailService,
    },
    {
      provide: 'MAIL_GATEWAY',
      useClass: MailRmqGateway,
    },
    {
      provide: 'USER_REPO',
      useClass: UserRepository,
    },
    {
      provide: 'USER_DATABASE',
      useClass: UserPrismaAdapter,
    },
  ],
})
export class UserModule {}
