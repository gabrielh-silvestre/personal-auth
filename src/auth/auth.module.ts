import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RmqModule } from '#shared/modules/rmq/rmq.module';
import { CustomJwtModule } from '#shared/modules/jwt/Jwt.module';

import { LoginController } from '#auth/infra/api/controller/login/Login.controller';
import { LoginUseCase } from '#auth/useCase/login/Login.useCase';

import { RefreshController } from '#auth/infra/api/controller/refresh/Refresh.controller';
import { RefreshUseCase } from '#auth/useCase/refresh/Refresh.useCase';

import { VerifyTokenController } from '#auth/infra/api/controller/verifyToken/VerifyToken.controller';
import { VerifyTokenUseCase } from '#auth/useCase/verifyToken/VerifyToken.useCase';

import { GenerateTokenController } from '#auth/infra/api/controller/generateToken/GenerateToken.controller';
import { GenerateTokenUseCase } from '#auth/useCase/generateToken/GenerateToken.useCase';

import { JwtAccessTokenStrategy } from '#auth/infra/strategy/Jwt.access-token.strategy';
import { JwtRefreshTokenStrategy } from '#auth/infra/strategy/Jwt.refresh-token.strategy';
import { LocalStrategy } from '#auth/infra/strategy/Local.strategy';

import {
  tokenSchema,
  TokenSchema,
} from '#auth/infra/adapter/database/mongoose/MongooseSchema';
import { DatabaseMongooseAdapter } from '#auth/infra/adapter/database/mongoose/DatabaseMongoose.adapter';
import { DatabaseGateway } from '#auth/infra/gateway/database/Database.gateway';

import { UserRmqAdapter } from '#auth/infra/adapter/user/rmq/UserRmq.adapter';
import { UserGateway } from '#auth/infra/gateway/user/User.gateway';

import {
  DATABASE_ADAPTER,
  DATABASE_GATEWAY,
  USER_ADAPTER,
  USER_GATEWAY,
} from '#auth/utils/constants/index';

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
