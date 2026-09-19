import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RmqModule } from '@shared/modules/rmq/rmq.module.js';
import { CustomJwtModule } from '@shared/modules/jwt/Jwt.module.js';

import { LoginController } from './infra/api/controller/login/Login.controller.js';
import { LoginUseCase } from './useCase/login/Login.useCase.js';

import { RefreshController } from './infra/api/controller/refresh/Refresh.controller.js';
import { RefreshUseCase } from './useCase/refresh/Refresh.useCase.js';

import { VerifyTokenController } from './infra/api/controller/verifyToken/VerifyToken.controller.js';
import { VerifyTokenUseCase } from './useCase/verifyToken/VerifyToken.useCase.js';

import { GenerateTokenController } from './infra/api/controller/generateToken/GenerateToken.controller.js';
import { GenerateTokenUseCase } from './useCase/generateToken/GenerateToken.useCase.js';

import { JwtAccessTokenStrategy } from './infra/strategy/Jwt.access-token.strategy.js';
import { JwtRefreshTokenStrategy } from './infra/strategy/Jwt.refresh-token.strategy.js';
import { LocalStrategy } from './infra/strategy/Local.strategy.js';

import {
  tokenSchema,
  TokenSchema,
} from './infra/adapter/database/mongoose/MongooseSchema.js';
import { DatabaseMongooseAdapter } from './infra/adapter/database/mongoose/DatabaseMongoose.adapter.js';
import { DatabaseGateway } from './infra/gateway/database/Database.gateway.js';

import { UserRmqAdapter } from './infra/adapter/user/rmq/UserRmq.adapter.js';
import { UserGateway } from './infra/gateway/user/User.gateway.js';

import {
  DATABASE_ADAPTER,
  DATABASE_GATEWAY,
  USER_ADAPTER,
  USER_GATEWAY,
} from './utils/constants/index.js';

@Module({
  imports: [
    CustomJwtModule,
    RmqModule.register('MAIL'),
    RmqModule.register('USER'),
    MongooseModule.forFeature([
      { name: TokenSchema.name, schema: tokenSchema },
    ]),
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
      provide: USER_ADAPTER,
      useClass: UserRmqAdapter,
    },
    {
      provide: USER_GATEWAY,
      useClass: UserGateway,
    },
    {
      provide: DATABASE_ADAPTER,
      useClass: DatabaseMongooseAdapter,
    },
    {
      provide: DATABASE_GATEWAY,
      useClass: DatabaseGateway,
    },
  ],
})
export class AuthModule {}
