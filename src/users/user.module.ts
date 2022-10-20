import { Module } from '@nestjs/common/decorators';

// import { TokenModule } from '@tokens/token.module';
// import { MailModule } from '@mail/mail.module';

import { UserPrismaRepository } from './infra/repository/prisma/User.repository';

// import { UserCreatedEventHandler } from './infra/event/handler/user-created.event.handler';

import { CreateUserUseCase } from './useCase/create/CreateUser.useCase';
import { CreateUserController } from './infra/api/controller/create/CreateUser.controller';

@Module({
  // imports: [TokenModule, MailModule],
  exports: [],
  controllers: [CreateUserController],
  providers: [
    CreateUserUseCase,
    // UserCreatedEventHandler,
    {
      provide: 'USER_REPO',
      useClass: UserPrismaRepository,
    },
  ],
})
export class UserModule {}
