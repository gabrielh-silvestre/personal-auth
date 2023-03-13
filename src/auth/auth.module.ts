import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RmqModule } from '@shared/modules/rmq/rmq.module';
import { CustomJwtModule } from '@shared/modules/jwt/Jwt.module';

import { LoginController } from './infra/api/controller/login/Login.controller';
import { LoginUseCase } from './useCase/login/Login.useCase';

import { RefreshController } from './infra/api/controller/refresh/Refresh.controller';
import { RefreshUseCase } from './useCase/refresh/Refresh.useCase';

import { VerifyTokenController } from './infra/api/controller/verifyToken/VerifyToken.controller';
import { VerifyTokenUseCase } from './useCase/verifyToken/VerifyToken.useCase';

import { GenerateTokenController } from './infra/api/controller/generateToken/GenerateToken.controller';
import { GenerateTokenUseCase } from './useCase/generateToken/GenerateToken.useCase';

import { JwtAccessTokenStrategy } from './infra/strategy/Jwt.access-token.strategy';
import { JwtRefreshTokenStrategy } from './infra/strategy/Jwt.refresh-token.strategy';
import { LocalStrategy } from './infra/strategy/Local.strategy';

import { tokenSchema } from './infra/adapter/orm/mongoose/Token.schema';
import { OrmMongooseAdapter } from './infra/adapter/orm/mongoose/OrmMongoose.adapter';
import { QueueRmqAdapter } from './infra/adapter/queue/rmq/QueueRmq.adapter';

import { DatabaseGateway } from './infra/gateway/database/Database.gateway';
import { UserGateway } from './infra/gateway/user/User.gateway';

import {
  ORM_ADAPTER,
  DATABASE_GATEWAY,
  QUEUE_ADAPTER,
  USER_GATEWAY,
  AUTH_QUEUE,
  TOKEN_SCHEMA,
} from './utils/constants';

@Module({
  imports: [
    CustomJwtModule,
    RmqModule.register(AUTH_QUEUE),
    MongooseModule.forFeature([{ name: TOKEN_SCHEMA, schema: tokenSchema }]),
  ],
  controllers: [
    LoginController,
    RefreshController,
    VerifyTokenController,
    GenerateTokenController,
  ],
  providers: [
    LoginUseCase,
    RefreshUseCase,
    VerifyTokenUseCase,
    LocalStrategy,
    GenerateTokenUseCase,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    {
      provide: QUEUE_ADAPTER,
      useClass: QueueRmqAdapter,
    },
    {
      provide: USER_GATEWAY,
      useClass: UserGateway,
    },
    {
      provide: ORM_ADAPTER,
      useClass: OrmMongooseAdapter,
    },
    {
      provide: DATABASE_GATEWAY,
      useClass: DatabaseGateway,
    },
  ],
})
export class AuthModule {}
