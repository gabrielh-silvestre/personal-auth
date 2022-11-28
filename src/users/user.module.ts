import { Module } from '@nestjs/common/decorators';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@auth/auth.module';
import { RmqModule } from '@shared/modules/rmq/rmq.module';

import { UserPrismaGateway } from './infra/gateway/database/prisma/UserPrisma.gateway';
import { UserRepository } from './infra/repository/User.repository';

import { CreateUserController } from './infra/api/controller/create/CreateUser.controller';
import { GetMeController } from './infra/api/controller/getMe/GetMe.controller';

import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';
import { GetUserByIdUseCase } from './useCase/getById/GetUserById.useCase';
import { GetUserByEmailUseCase } from './useCase/getByEmail/GetUserByEmail.useCase';

import { MailServiceAdaptor } from './infra/service/mail/Mail.service.adaptor';

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
      useClass: MailServiceAdaptor,
    },
    {
      provide: 'USER_REPO',
      useClass: UserRepository,
    },
    {
      provide: 'USER_DATABASE',
      useClass: UserPrismaGateway,
    },
  ],
})
export class UserModule {}
