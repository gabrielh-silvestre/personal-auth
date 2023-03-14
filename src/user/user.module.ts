import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateUserHandler } from './infra/event/handler/CreateUser.handler';
import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';

import { UpdateEmailHandler } from './infra/event/handler/UpdateEmail.handler';
import { UpdateEmailUseCase } from './useCase/updateEmail/UpdateEmail.useCase';

import { UpdatePasswordHandler } from './infra/event/handler/UpdatePassword.handler';
import { UpdatePasswordUseCase } from './useCase/updatePassword/UpdatePassword.useCase';

import { userSchema } from './infra/adapter/orm/mongoose/User.schema';
import { OrmMongooseAdapter } from './infra/adapter/orm/mongoose/OrmMongoose.adapter';

import { UserRepository } from './infra/repository/User.repository';

import {
  ORM_ADAPTER,
  USER_REPOSITORY,
} from '@shared/utils/constants/injectNames';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'USER_SCHEMA', schema: userSchema }]),
  ],
  controllers: [CreateUserHandler, UpdateEmailHandler, UpdatePasswordHandler],
  providers: [
    CreateUserUseCase,
    UpdateEmailUseCase,
    UpdatePasswordUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: ORM_ADAPTER,
      useClass: OrmMongooseAdapter,
    },
  ],
  exports: [{ provide: USER_REPOSITORY, useClass: UserRepository }],
})
export class UserModule {}
