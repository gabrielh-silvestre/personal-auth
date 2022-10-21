import { Module } from '@nestjs/common/decorators';

import { UserPrismaRepository } from './infra/repository/prisma/User.repository';

import { CreateUserController } from './infra/api/controller/create/CreateUser.controller';

import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';
import { GetUserByIdUseCase } from './useCase/getById/GetUserById.useCase';
import { GetUserByEmailUseCase } from './useCase/getByEmail/GetUserByEmail.useCase';

@Module({
  exports: [GetUserByIdUseCase, GetUserByEmailUseCase],
  controllers: [CreateUserController],
  providers: [
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    {
      provide: 'USER_REPO',
      useClass: UserPrismaRepository,
    },
  ],
})
export class UserModule {}
