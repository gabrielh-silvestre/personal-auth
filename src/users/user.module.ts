import { Module } from '@nestjs/common';

import { UserGrpcServerController } from './infra/grpc/server/controller/User.grpc-server.controller';
import { UserPrismaRepository } from './infra/repository/prisma/User.repository';
import { UserRestController } from './infra/rest/controller/User.rest.controller';

import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserGrpcServerController, UserRestController],
  providers: [
    UserService,
    {
      provide: 'USER_REPO',
      useClass: UserPrismaRepository,
    },
  ],
})
export class UserModule {}
