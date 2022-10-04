import { Module } from '@nestjs/common';

import { UserGrpcServerController } from './infra/grpc/server/controller/User.grpc-server.controller';
import { UserInMemoryRepository } from './infra/repository/memory/User.repository';

import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserGrpcServerController],
  providers: [UserService, UserInMemoryRepository],
})
export class UserModule {}
