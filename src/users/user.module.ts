import { Module } from '@nestjs/common/decorators';

import { TokenModule } from '@tokens/token.module';
import { UserService } from './user.service';

import { UserGrpcServerController } from './infra/grpc/server/controller/User.grpc-server.controller';
import { UserPrismaRepository } from './infra/repository/prisma/User.repository';
import { UserRestController } from './infra/rest/controller/User.rest.controller';
import { UserCreatedEventHandler } from './infra/event/handler/user-created.event.handler';

@Module({
  imports: [TokenModule],
  exports: [UserService],
  controllers: [UserGrpcServerController, UserRestController],
  providers: [
    UserService,
    UserCreatedEventHandler,
    {
      provide: 'USER_REPO',
      useClass: UserPrismaRepository,
    },
  ],
})
export class UserModule {}
