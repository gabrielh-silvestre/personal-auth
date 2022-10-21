import { Module } from '@nestjs/common/decorators';

import { UserPrismaRepository } from './infra/repository/prisma/User.repository';

import { TokenModule } from '@tokens/token.module';

import { GetMeController } from './infra/api/controller/getMe/GetMe.controller';
import { CreateUserController } from './infra/api/controller/create/CreateUser.controller';

import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';
import { GetUserByIdUseCase } from './useCase/getById/GetUserById.useCase';
import { GetUserByEmailUseCase } from './useCase/getByEmail/GetUserByEmail.useCase';

@Module({
  imports: [TokenModule],
  exports: [GetUserByIdUseCase, GetUserByEmailUseCase],
  controllers: [CreateUserController, GetMeController],
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
