import { Module } from '@nestjs/common';

import { UserGrpcServerController } from './infra/grpc/server/controller/User.grpc-server.controller';
import { UserPrismaRepository } from './infra/repository/prisma/User.repository';

import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserGrpcServerController],
  providers: [
    UserService,
    {
      provide: 'USER_REPO',
      useClass: UserPrismaRepository,
    },
  ],
})
export class UserModule {}
