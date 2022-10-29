import { Module } from '@nestjs/common/decorators';
import { MongooseModule } from '@nestjs/mongoose';

import { RevokeTokenController } from './infra/api/controller/RevokeToken.controller';

import { RevokeTokenUseCase } from './useCase/revoke/RevokeToken.useCase';
import { CreateTokenUseCase } from './useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from './useCase/validate/ValidateToken.useCase';

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
    ValidateTokenUseCase,
    {
      provide: 'TOKEN_REPO',
      useClass: TokenMongooseRepository,
    },
  ],
  exports: [CreateTokenUseCase, ValidateTokenUseCase],
})
export class TokenModule {}
