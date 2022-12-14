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

import {
  tokenSchema,
  TokenSchema,
} from './infra/adapter/database/mongoose/MongooseSchema';
import { DatabaseMongooseAdapter } from './infra/adapter/database/mongoose/DatabaseMongoose.adapter';
import { DatabaseGateway } from './infra/gateway/database/Database.gateway';

import { UserRmqAdapter } from './infra/adapter/user/rmq/UserRmq.adapter';
import { UserGateway } from './infra/gateway/user/User.gateway';

import {
  DATABASE_ADAPTER,
  DATABASE_GATEWAY,
  USER_ADAPTER,
  USER_GATEWAY,
} from './utils/constants';

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
