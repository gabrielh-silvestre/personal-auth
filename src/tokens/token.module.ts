import { Module } from '@nestjs/common/decorators';
import { MongooseModule } from '@nestjs/mongoose';

import { RevokeTokenController } from './infra/api/controller/RevokeToken.controller';

import { TokenFacade } from './infra/facade/Token.facade';

import { RevokeTokenUseCase } from './useCase/revoke/RevokeToken.useCase';
import { CreateTokenUseCase } from './useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from './useCase/validate/ValidateToken.useCase';
import { RefreshTokenUseCase } from './useCase/refresh/RefreshToken.useCase';

import { TokenMongooseRepository } from './infra/repository/mongoose/Token.repository';
import {
  tokenSchema,
  TokenSchema,
} from './infra/repository/mongoose/Token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenSchema.name, schema: tokenSchema },
    ]),
  ],
  controllers: [RevokeTokenController],
  providers: [
    RevokeTokenUseCase,
    CreateTokenUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    TokenFacade,
    {
      provide: 'TOKEN_REPO',
      useClass: TokenMongooseRepository,
    },
  ],
  exports: [TokenFacade],
})
export class TokenModule {}
