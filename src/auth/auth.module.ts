import { Module } from '@nestjs/common';

import { TokenModule } from '@tokens/token.module';

import { RmqModule } from '@shared/modules/rmq/rmq.module';
import { CustomJwtModule } from '@shared/modules/jwt/Jwt.module';

import { LoginController } from './infra/api/controller/login/Login.controller';
import { LoginUseCase } from './useCase/login/Login.useCase';

import { RefreshController } from './infra/api/controller/refresh/Refresh.controller';
import { RefreshUseCase } from './useCase/refresh/Refresh.useCase';

import { JwtAccessTokenStrategy } from './infra/strategy/Jwt.access-token.strategy';
import { JwtRefreshTokenStrategy } from './infra/strategy/Jwt.refresh-token.strategy';
import { LocalStrategy } from './infra/strategy/Local.strategy';

import { UserRmqAdapter } from './infra/adapter/user/rmq/UserRmq.adapter';
import { UserGateway } from './infra/gateway/user/User.gateway';

import { TokenServiceAdapter } from './infra/adapter/token/service/TokenService.adapter';
import { TokenGateway } from './infra/gateway/token/Token.gateway';

import {
  TOKEN_ADAPTER,
  TOKEN_GATEWAY,
  USER_ADAPTER,
  USER_GATEWAY,
} from './utils/constants';

@Module({
  imports: [
    CustomJwtModule,
    RmqModule.register('MAIL'),
    RmqModule.register('USER'),
    TokenModule,
  ],
  controllers: [LoginController, RefreshController],
  providers: [
    LoginUseCase,
    RefreshUseCase,
    LocalStrategy,
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
      provide: TOKEN_ADAPTER,
      useClass: TokenServiceAdapter,
    },
    {
      provide: TOKEN_GATEWAY,
      useClass: TokenGateway,
    },
  ],
})
export class AuthModule {}
